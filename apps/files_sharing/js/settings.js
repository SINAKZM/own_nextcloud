$(document).ready(function() {
	$("#incomingServer2serverShareEnabled").change(function() {
		if(this.checked) {
			$('#ReceiveShareUserPermission').find('input').each(function () {
				$(this).removeAttr('disabled');
			});
			$('#ReceiveShareGroupPermission').find('input').each(function () {
				$(this).removeAttr('disabled');
			});
		}else{
			$('#ReceiveShareUserPermission').find('input').each(function () {
				$(this).attr('disabled', 'disabled');
			});
			$('#ReceiveShareGroupPermission').find('input').each(function () {
				$(this).attr('disabled', 'disabled');
			});
			// $('#ReceiveShareUserPermission').hide();
			// $('#ReceiveShareGroupPermission').hide();
		}
	});
	if ($("#incomingServer2serverShareEnabled")[0].checked){
		$('#ReceiveShareUserPermission').find('input').each(function () {
			$(this).removeAttr('disabled');
		});
		$('#ReceiveShareUserPermission').find('input').each(function () {
			$(this).removeAttr('disabled');
		});
	}else {
		$('#ReceiveShareUserPermission').find('input').each(function () {
			$(this).attr('disabled', 'disabled');
		});
		$('#ReceiveShareGroupPermission').find('input').each(function () {
			$(this).attr('disabled', 'disabled');
		});
	}

	// outgoingServer2serverShareEnabled
	$("#outgoingServer2serverShareEnabled").change(function() {
		if(this.checked) {
			$('#SendShareUserPermission').find('input').each(function () {
				$(this).removeAttr('disabled');
			});
			$('#SendShareGroupPermission').find('input').each(function () {
				$(this).removeAttr('disabled');
			});
		}else{
			$('#SendShareUserPermission').find('input').each(function () {
				$(this).attr('disabled', 'disabled');
			});
			$('#SendShareGroupPermission').find('input').each(function () {
				$(this).attr('disabled', 'disabled');
			});
		}
	});
	if ($("#outgoingServer2serverShareEnabled")[0].checked){
		$('#SendShareUserPermission').find('input').each(function () {
			$(this).removeAttr('disabled');
		});
		$('#SendShareGroupPermission').find('input').each(function () {
			$(this).removeAttr('disabled');
		});
	}else {
		$('#SendShareUserPermission').find('input').each(function () {
			$(this).attr('disabled', 'disabled');
		});
		$('#SendShareGroupPermission').find('input').each(function () {
			$(this).attr('disabled', 'disabled');
		});
	}


	// if (!$("#incomingServer2serverShareEnabled")[0].checked && !$("#incomingServer2serverGroupShareEnabled")[0].checked){
	// 	$('#outgoingServer2serverShareEnabledExcludes').show();
	// }else {
	// 	$('#outgoingServer2serverShareEnabledExcludes').hide();
	// }
	// $('#incomingServer2serverShareEnabled').change(function (){
	// 	if (!this.checked && !$("#incomingServer2serverGroupShareEnabled")[0].checked){
	// 		$('#outgoingServer2serverShareEnabledExcludes').show();
	// 	}else {
	// 		$('#outgoingServer2serverShareEnabledExcludes').hide();
	// 	}
	// });
	// $('#incomingServer2serverGroupShareEnabled').change(function (){
	// 	if (!$("#incomingServer2serverShareEnabled")[0].checked && !this.checked){
	// 		$('#outgoingServer2serverShareEnabledExcludes').show();
	// 	}else {
	// 		$('#outgoingServer2serverShareEnabledExcludes').hide();
	// 	}
	// });
	$('.ApproveCloudShare').on('click', function(event){
		var btn = $(this);
		$.ajax({
			url: OC.generateUrl('/ocs/v2.php/apps/files_sharing/api/v1/shares/approve_external_share'),
			type: 'POST',
			data: {
				"id": $(btn).data().bind
			},
			dataType: 'json', // added data type
			success: function (res) {
				btn.parents('tr').last().remove();
				const data = res.result;
			}
		});
	});
	$('.RejectCloudShare').on('click', function(event){
		var btn = $(this);
		$.ajax({
			url: OC.generateUrl('/ocs/v2.php/apps/files_sharing/api/v1/shares/reject_external_share'),
			type: 'POST',
			data: {
				"id": $(btn).data().bind
			},
			dataType: 'json', // added data type
			success: function (res) {
				btn.parents('tr').last().remove();
				const data = res.result;
			}
		});
	});
	$("#ReceiverGroups").select2({
		initSelection : function (element, callback) {
			$.ajax({
				url: OC.generateUrl('/ocs/v2.php/apps/files_sharing/api/v1/shares/federation_user/index'),
				type: 'GET',
				data: {
					"type": 0,
					"is_group": 1
				},
				dataType: 'json', // added data type
				async: false,
				success: function (res) {
					const data = [];
					res.result.map(item => {
						data.push({id: item.gid, text: item.gid});//Push values to data array
					});
					callback(data);
				}
			});
		},
		ajax: {
			url: OC.generateUrl('/ocs/v2.php/apps/files_sharing/api/v1/shares/group/search'),
			dataType: 'json',
			data: (params) => {
				console.log(params)
				return {
					search: params,
				};
			},
			results: (data, params) => {
				const results = data.result.map((item, index) => {
					return {
						id: item.displayname,
						text: item.displayname,
					};
				});
				return {
					results: results,
				};
			},
		},
		multiple: true,
	});
	$("#ReceiverUsers").select2({
		initSelection : function (element, callback) {
			$.ajax({
				url: OC.generateUrl('/ocs/v2.php/apps/files_sharing/api/v1/shares/federation_user/index'),
				type: 'GET',
				data: {
					"type": 0,
					"is_group": 0
				},
				dataType: 'json', // added data type
				async: false,
				success: function (res) {
					const data = [];
					res.result.map(item => {
						data.push({id: item.uid, text: item.uid});//Push values to data array
					});
					callback(data);
				}
			});
		},
		ajax: {
			url: OC.generateUrl('/ocs/v2.php/apps/files_sharing/api/v1/shares/user/search'),
			dataType: 'json',
			data: (params) => {
				console.log(params)
				return {
					search: params,
				};
			},
			results: (data, params) => {
				const results = data.result.map((item, index) => {
					return {
						id: item.uid,
						text: item.uid,
					};
				});
				return {
					results: results,
				};
			},
		},
		multiple: true
	});
	$("#SenderGroups").select2({
		initSelection : function (element, callback) {
			$.ajax({
				url: OC.generateUrl('/ocs/v2.php/apps/files_sharing/api/v1/shares/federation_user/index'),
				type: 'GET',
				data: {
					"type": 1,
					"is_group": 1
				},
				dataType: 'json', // added data type
				async: false,
				success: function (res) {
					const data = [];
					res.result.map(item => {
						data.push({id: item.gid, text: item.gid});//Push values to data array
					});
					callback(data);
				}
			});
		},
		ajax: {
			url: OC.generateUrl('/ocs/v2.php/apps/files_sharing/api/v1/shares/group/search'),
			dataType: 'json',
			data: (params) => {
				console.log(params)
				return {
					search: params,
				};
			},
			results: (data, params) => {
				const results = data.result.map((item, index) => {
					return {
						id: index+1,
						text: item.displayname,
					};
				});
				return {
					results: results,
				};
			},
		},
		multiple: true
	});
	$("#SenderUsers").select2({
		initSelection : function (element, callback) {
			$.ajax({
				url: OC.generateUrl('/ocs/v2.php/apps/files_sharing/api/v1/shares/federation_user/index'),
				type: 'GET',
				data: {
					"type": 1,
					"is_group": 0
				},
				dataType: 'json', // added data type
				async: false,
				success: function (res) {
					const data = [];
					res.result.map(item => {
						data.push({id: item.uid, text: item.uid});//Push values to data array
					});
					callback(data);
				}
			});
		},
		ajax: {
			url: OC.generateUrl('/ocs/v2.php/apps/files_sharing/api/v1/shares/user/search'),
			dataType: 'json',
			data: (params) => {
				return {
					search: params,
				};
			},
			results: (data, params) => {
				const results = data.result.map((item, index) => {
					return {
						id: index+1,
						text: item.uid,
					};
				});
				return {
					results: results,
				};
			},
		},
		multiple: true
	});
	$('#ReceiverGroups').on("select2-selecting", function(e) {
		var gid = e.choice.text;
		$.ajax({
			url: OC.generateUrl('/ocs/v2.php/apps/files_sharing/api/v1/shares/federation_user/store'),
			type: 'POST',
			data: {
				"gid": gid,
				"type": 0,
			},
			dataType: 'json', // added data type
			success: function (res) {
				console.log("DONE")
			}
		});


	});
	$('#ReceiverGroups').on('select2-removed', function (e) {
		$.ajax({
			url: OC.generateUrl('/ocs/v2.php/apps/files_sharing/api/v1/shares/federation_user/remove'),
			type: 'POST',
			data: {
				"type": 0,
				"gid": e.choice.text,
			},
			dataType: 'json', // added data type
			success: function (res) {
				console.log("DONE")
			}
		});
	});
	$('#ReceiverUsers').on("select2-selecting", function(e) {
		var uid = e.choice.text;
		$.ajax({
			url: OC.generateUrl('/ocs/v2.php/apps/files_sharing/api/v1/shares/federation_user/store'),
			type: 'POST',
			data: {
				"uid": uid,
				"type": 0,
			},
			dataType: 'json', // added data type
			success: function (res) {
				console.log("DONE")
			}
		});


	});
	$('#ReceiverUsers').on('select2-removed', function (e) {
		$.ajax({
			url: OC.generateUrl('/ocs/v2.php/apps/files_sharing/api/v1/shares/federation_user/remove'),
			type: 'POST',
			data: {
				"type": 0,
				"uid": e.choice.text,
			},
			dataType: 'json', // added data type
			success: function (res) {
				console.log("DONE")
			}
		});
	});


	$('#SenderUsers').on("select2-selecting", function(e) {
		var uid = e.choice.text;
		$.ajax({
			url: OC.generateUrl('/ocs/v2.php/apps/files_sharing/api/v1/shares/federation_user/store'),
			type: 'POST',
			data: {
				"uid": uid,
				"type": 1,
			},
			dataType: 'json', // added data type
			success: function (res) {
				console.log("DONE")
			}
		});


	});
	$('#SenderUsers').on('select2-removed', function (e) {
		$.ajax({
			url: OC.generateUrl('/ocs/v2.php/apps/files_sharing/api/v1/shares/federation_user/remove'),
			type: 'POST',
			data: {
				"type": 1,
				"uid": e.choice.text,
			},
			dataType: 'json', // added data type
			success: function (res) {
				console.log("DONE")
			}
		});
	});

	$('#SenderGroups').on("select2-selecting", function(e) {
		var gid = e.choice.text;
		$.ajax({
			url: OC.generateUrl('/ocs/v2.php/apps/files_sharing/api/v1/shares/federation_user/store'),
			type: 'POST',
			data: {
				"gid": gid,
				"type": 1,
			},
			dataType: 'json', // added data type
			success: function (res) {
				console.log("DONE")
			}
		});


	});
	$('#SenderGroups').on('select2-removed', function (e) {
		$.ajax({
			url: OC.generateUrl('/ocs/v2.php/apps/files_sharing/api/v1/shares/federation_user/remove'),
			type: 'POST',
			data: {
				"type": 1,
				"gid": e.choice.text,
			},
			dataType: 'json', // added data type
			success: function (res) {
				console.log("DONE")
			}
		});
	});
});
