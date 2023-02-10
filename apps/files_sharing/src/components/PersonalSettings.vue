<!--
  - @copyright 2019 Roeland Jago Douma <roeland@famdouma.nl>
  -
  - @author 2019 Roeland Jago Douma <roeland@famdouma.nl>
  - @author Hinrich Mahler <nextcloud@mahlerhome.de>
  -
  - @license GNU AGPL version 3 or any later version
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program.  If not, see <http://www.gnu.org/licenses/>.
  -->

<template>
	<div v-if="!enforceAcceptShares || allowCustomDirectory"
		 id="files-sharing-personal-settings" class="section">
		<h2>{{ t('files_sharing', 'Sharing') }}</h2>
		<p v-if="!enforceAcceptShares">
			<input id="files-sharing-personal-settings-accept"
				   v-model="accepting"
				   class="checkbox"
				   type="checkbox"
				   @change="toggleEnabled">
			<label for="files-sharing-personal-settings-accept">{{
					t('files_sharing', 'Accept user and group shares by default')
				}}</label>
		</p>
		<p v-if="allowCustomDirectory">
			<SelectShareFolderDialogue/>
		</p>
		<div v-if="isGroupAdmin">
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
				<tr v-for="federationShare in federationShares">
					<td>{{federationShare.id}}</td>
					<td>{{federationShare.from}}</td>
					<td>{{federationShare.share_with}}</td>
					<td v-if="federationShare.share_type == '6'">user</td>
					<td v-else>group</td>
					<td>{{federationShare.path}}</td>
					<td>
						<button @click="approveFederationShare(federationShare.id)" class="ApproveCloudShare">Approve</button>
						<button @click="rejectFederationShare(federationShare.id)" class="RejectCloudShare">Reject</button>
					</td>
				</tr>
			</table>
		</div>

	</div>
</template>

<script>
import {generateUrl} from '@nextcloud/router'
import {loadState} from '@nextcloud/initial-state'
import {showError} from '@nextcloud/dialogs'
import axios from '@nextcloud/axios'

import SelectShareFolderDialogue from './SelectShareFolderDialogue'

export default {
	name: 'PersonalSettings',
	components: {
		SelectShareFolderDialogue,
	},
	data () {
		return {
			isGroupAdmin: loadState('files_sharing', 'is_group_admin'),
			federationShares: loadState('files_sharing', 'federation_shares'),
			// Share acceptance config
			accepting: loadState('files_sharing', 'accept_default'),
			enforceAcceptShares: loadState('files_sharing', 'enforce_accept'),

			// Receiving share folder config
			allowCustomDirectory: loadState('files_sharing', 'allow_custom_share_folder'),
		}
	},

	methods: {
		async toggleEnabled () {
			try {
				await axios.put(generateUrl('/apps/files_sharing/settings/defaultAccept'), {
					accept: this.accepting,
				})
			} catch (error) {
				showError(t('sharing', 'Error while toggling options'))
				console.error(error)
			}
		},
		approveFederationShare(id){
			let self = this;
			axios.post(generateUrl('/ocs/v2.php/apps/files_sharing/api/v1/shares/approve_external_share'),{
				"id": id
			}).then(res=>{
				alert("shared successfully")
				self.indexFederationShares();
			}).catch(err=> {
				alert("something went wrong")
			});
		},
		rejectFederationShare(id){
			let self = this;
			axios.post(generateUrl('/ocs/v2.php/apps/files_sharing/api/v1/shares/reject_external_share'),{
				"id": id
			}).then(res=>{
				alert("rejected successfully")
				self.indexFederationShares();
			}).catch(err=> {
				alert("something went wrong")
			});
		},
		indexFederationShares(){
			let self = this;
			axios.get(generateUrl('/ocs/v2.php/apps/files_sharing/api/v1/shares/federation_shares_list/index')).then(res=>{
				self.federationShares = res.data.result;
			}).catch(err=> {
				alert("something is wrong")
			});
		},
	},
}
</script>

<style scoped lang="scss">
p {
	margin-top: 12px;
	margin-bottom: 12px;
}

.styled-table {
	border-collapse: collapse;
	margin: 25px 0;
	font-size: 0.9em;
	font-family: sans-serif;
	min-width: 400px;
	box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
}

.styled-table thead tr {
	background-color: #0082c9;
	color: #ffffff;
	text-align: left;
}

.styled-table th,
.styled-table td {
	padding: 12px 15px;
}

.styled-table tbody tr td {
	text-align: center;
}

.styled-table tbody tr {
	border-bottom: 1px solid #dddddd;
}

.styled-table tbody tr:nth-of-type(even) {
	background-color: #f3f3f3;
}

.styled-table tbody tr:last-of-type {
	border-bottom: 2px solid #0082c9;
}

.styled-table tbody tr.active-row {
	font-weight: bold;
	color: #0082c9;
}
</style>
