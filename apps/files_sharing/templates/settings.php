<?php
style('files_sharing', 'settings');
script('files_sharing', 'settings');
/** @var array $_ */
/** @var \OCP\IL10N $l */
?>
<div style="padding: 30px">
	<h1><b>Federated Cloud Sharing Approval</b></h1>
	<table class="styled-table">
		<tr>
			<td>id</td>
			<td>from</td>
			<td>with</td>
			<td>type</td>
			<td>path</td>
			<td>check</td>
		</tr>
		<?php foreach ($_['data'] as $key=>$row) : ?>
			<tr>
				<td><?php echo $row['id']; ?></td>
				<td><?php echo $row['from'] ?></td>
				<td><?php echo $row['share_with']; ?></td>
				<td><?php echo $row['share_type'] == "6" ? "user" : "group" ?></td>
				<td><?php echo $row['path']; ?></td>
				<td><button data-bind=<?php echo $row['id']?> class="ApproveCloudShare">Approve</button><button data-bind=<?php echo $row['id']?> class="RejectCloudShare">Reject</button></td>
			</tr>
		<?php endforeach; ?>
	</table>
</div>
