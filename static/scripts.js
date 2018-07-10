var API_ENDPOINT = "https://tywpqdjci4.execute-api.us-east-1.amazonaws.com/PollyDev"

document.getElementById("sayButton").onclick = function () {
	var inputData = {
		"voice": $('#voiceSelected option:selected').val(),
		"text": $('#postText').val()
	};
	$.ajax({
		url: API_ENDPOINT,
		type: 'POST',
		crossDomain: true,
		data: JSON.stringify(inputData),
		contentType: 'application/json; charset=utf-8',
		success: function (response) {
			document.getElementById("postIDreturned").textContent = "Post ID: " + response.recordId;
		},
		error: function () {
			alert("error");
		}
	});
}
document.getElementById("searchButton").onclick = function () {
	var postId = $('#postId').val();
	$.ajax({
		url: API_ENDPOINT + '?postId=' + postId,
		type: 'GET',
		crossDomain: true,
		success: function (response) {
			$('#posts tr').slice(1).remove();
			jQuery.each(response, function (i, data) {
				var player = "<audio controls><source src='" + data['Audiourl'] + "' type='audio/mpeg'></audio>"
				if (typeof data['Audiourl'] === "undefined") {
					var player = ""
				}
				$("#posts").append("<tr> \
								<td>" + data['Id'] + "</td> \
								<td>" + data['voice'] + "</td> \
								<td>" + data['text'] + "</td> \
								<td>" + data['process_status'] + "</td> \
								<td>" + player + "</td> \
								</tr>");
			});
		},
		error: function () {
			alert("error");
		}
	});
}

document.getElementById("postText").onkeyup = function () {
	var length = $(postText).val().length;
	document.getElementById("charCounter").textContent = "Characters: " + length;
}
