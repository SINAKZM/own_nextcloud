window.addEventListener('DOMContentLoaded', function() {
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
	$('#fileSharingSettings input').change(function() {
		var value = 'no';
		if (this.checked) {
			value = 'yes';
		}
		OCP.AppConfig.setValue('files_sharing', $(this).attr('name'), value);
	});
});
