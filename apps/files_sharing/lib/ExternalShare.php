<?php

namespace OCA\Files_Sharing;

use OC\Files\FileInfo;
use OCA\Files_Sharing\External\Storage;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\OCS\OCSBadRequestException;
use OCP\AppFramework\OCS\OCSException;
use OCP\AppFramework\OCS\OCSForbiddenException;
use OCP\AppFramework\OCS\OCSNotFoundException;
use OCP\Constants;
use OCP\Files\InvalidPathException;
use OCP\Files\IRootFolder;
use OCP\Files\NotFoundException;
use OCP\IConfig;
use OCP\IDBConnection;
use OCP\IL10N;
use OCP\Lock\ILockingProvider;
use OCP\Lock\LockedException;
use OCP\Share\Exceptions\GenericShareException;
use OCP\Share\IManager;
use OCP\Share\IShare;

/**
 * Class Share20OCS
 *
 * @package OCA\Files_Sharing\API
 */
class ExternalShare {
	const TYPE_FEDERATION_SHARE_RECEIVER_TYPE = 0;
	const TYPE_FEDERATION_SHARE_SENDER_TYPE = 1;
	/** @var IManager */
	private $shareManager;
	/** @var IRootFolder */
	private $rootFolder;
	/** @var IL10N */
	private $l;
	/** @var IConfig */
	private $config;
	private IDBConnection $IDBConnection;

	/**
	 * Share20OCS constructor.
	 *
	 * @param IManager $shareManager
	 * @param IRootFolder $rootFolder
	 * @param IL10N $l10n
	 * @param IConfig $config
	 */
	public function __construct(
		IManager $shareManager,
		IRootFolder $rootFolder,
		IL10N $l10n,
		IConfig $config,
		IDBConnection $IDBConnection
	) {
		$this->shareManager = $shareManager;
		$this->rootFolder = $rootFolder;
		$this->l = $l10n;
		$this->config = $config;
		$this->IDBConnection = $IDBConnection;
	}

	/**
	 * @NoAdminRequired
	 *
	 * @param string $path
	 * @param int $permissions
	 * @param int $shareType
	 * @param string $shareWith
	 * @param string $publicUpload
	 * @param string $password
	 * @param string $sendPasswordByTalk
	 * @param string $expireDate
	 * @param string $label
	 *
	 * @return bool
	 * @throws NotFoundException
	 * @throws OCSBadRequestException
	 * @throws OCSException
	 * @throws OCSForbiddenException
	 * @throws OCSNotFoundException
	 * @throws InvalidPathException
	 * @suppress PhanUndeclaredClassMethod
	 */
	public function approveExternalShare($id) {
		$extShare = $this->IDBConnection->getQueryBuilder()->select("*")
			->from("share_external_list")
			->where("id = :id")
			->setParameter("id", $id)
			->executeQuery()
			->fetch();
		$share = $this->shareManager->newShare();

		if ($extShare['permisstions'] === null) {
			$permissions = $this->config->getAppValue('core', 'shareapi_default_permissions', Constants::PERMISSION_ALL);
		}
		// Verify path
		if ($extShare['path'] === null) {
			throw new OCSNotFoundException($this->l->t('Please specify a file or folder path'));
		}

		$userFolder = $this->rootFolder->getUserFolder($extShare['from']);
		try {
			/** @var \OC\Files\Node\Node $node */
			$node = $userFolder->get($extShare['path']);
		} catch (NotFoundException $e) {
			throw new OCSNotFoundException($this->l->t('Wrong path, file/folder does not exist'));
		}

		// a user can have access to a file through different paths, with differing permissions
		// combine all permissions to determine if the user can share this file
		$nodes = $userFolder->getById($node->getId());
		foreach ($nodes as $nodeById) {
			/** @var FileInfo $fileInfo */
			$fileInfo = $node->getFileInfo();
			$fileInfo['permissions'] |= $nodeById->getPermissions();
		}

		$share->setNode($node);
		try {
			$this->lock($share->getNode());
		} catch (LockedException $e) {
			throw new OCSNotFoundException($this->l->t('Could not create share'));
		}

		if ($permissions < 0 || $permissions > Constants::PERMISSION_ALL) {
			throw new OCSNotFoundException($this->l->t('Invalid permissions'));
		}

		// Shares always require read permissions
		$permissions |= Constants::PERMISSION_READ;

		if ($node instanceof \OCP\Files\File) {
			// Single file shares should never have delete or create permissions
			$permissions &= ~Constants::PERMISSION_DELETE;
			$permissions &= ~Constants::PERMISSION_CREATE;
		}
		/**
		 * Hack for https://github.com/owncloud/core/issues/22587
		 * We check the permissions via webdav. But the permissions of the mount point
		 * do not equal the share permissions. Here we fix that for federated mounts.
		 */
		if ($node->getStorage()->instanceOfStorage(Storage::class)) {
			$permissions &= ~($permissions & ~$node->getPermissions());
		}

		if ($extShare['share_type'] === IShare::TYPE_REMOTE) {
			if (!$this->shareManager->outgoingServer2ServerSharesAllowed()) {
				throw new OCSForbiddenException($this->l->t('Sharing %1$s failed because the back end does not allow shares from type %2$s', [$node->getPath(), $extShare['share_type']]));
			}

			if ($extShare['share_with'] === null) {
				throw new OCSNotFoundException($this->l->t('Please specify a valid federated user ID'));
			}

			$share->setSharedWith($extShare['share_with']);
			$share->setPermissions($permissions);
			if ($extShare['expire_date'] !== '') {
				try {
					$expireDate = $this->parseDate($extShare['expire_date']);
					$share->setExpirationDate($expireDate);
				} catch (\Exception $e) {
					throw new OCSNotFoundException($this->l->t('Invalid date, date format must be YYYY-MM-DD'));
				}
			}
		} elseif ($extShare['share_type'] === IShare::TYPE_REMOTE_GROUP) {
			if (!$this->shareManager->outgoingServer2ServerGroupSharesAllowed()) {
				throw new OCSForbiddenException($this->l->t('Sharing %1$s failed because the back end does not allow shares from type %2$s', [$node->getPath(), $extShare->share_type]));
			}

			if ($extShare['share_with'] === null) {
				throw new OCSNotFoundException($this->l->t('Please specify a valid federated group ID'));
			}

			$share->setSharedWith($extShare['share_with']);
			$share->setPermissions($permissions);
			if ($extShare['expire_date'] !== '') {
				try {
					$expireDate = $this->parseDate($extShare['expire_date']);
					$share->setExpirationDate($expireDate);
				} catch (\Exception $e) {
					throw new OCSNotFoundException($this->l->t('Invalid date, date format must be YYYY-MM-DD'));
				}
			}
		} else {
			throw new OCSBadRequestException($this->l->t('Unknown share type'));
		}

		$share->setShareType($extShare['share_type']);
		$share->setSharedBy($extShare['from']);

		if ($extShare['note'] !== '') {
			$share->setNote($extShare['note']);
		}
		try {
			$share = $this->shareManager->createShare($share);
		} catch (GenericShareException $e) {
			\OC::$server->getLogger()->logException($e);
			$code = $e->getCode() === 0 ? 403 : $e->getCode();
			throw new OCSException($e->getHint(), $code);
		} catch (\Exception $e) {
			\OC::$server->getLogger()->logException($e);
			throw new OCSForbiddenException($e->getMessage(), $e);
		}
		return true;
	}
	/**
	 * Make sure that the passed date is valid ISO 8601
	 * So YYYY-MM-DD
	 * If not throw an exception
	 *
	 * @param string $expireDate
	 *
	 * @return \DateTime
	 * @throws \Exception
	 */
	private function parseDate(string $expireDate): \DateTime {
		try {
			$date = new \DateTime($expireDate);
		} catch (\Exception $e) {
			throw new \Exception('Invalid date. Format must be YYYY-MM-DD');
		}

		$date->setTime(0, 0, 0);

		return $date;
	}
	/**
	 * Lock a Node
	 *
	 * @param \OCP\Files\Node $node
	 * @throws LockedException
	 */
	private function lock(\OCP\Files\Node $node) {
		$node->lock(ILockingProvider::LOCK_SHARED);
		$this->lockedNode = $node;
	}
}
