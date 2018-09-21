var upload = {};
upload.api = '//api.giga.gs';
upload.isPrivate = true;
upload.token;
upload.maxFileSize;
upload.myDropzone;

upload.sessionCheck = function(){
	axios.get( upload.api + '/session')
	.then(function (response) {
		upload.isPrivate= response.data.private;
		upload.token = response.data.token;
		upload.maxFileSize = response.data.maxFileSize;
		upload.prepareUpload();
	})
	.catch(function (error) {
		swal("An error ocurred", 'There was an error with the request, please check the console for more information.', "error");
		return console.log(error);
	});
}

upload.prepareUpload = function(){
	div = document.createElement('div');
	div.id = 'dropzone';
	div.innerHTML = 'Click here or drag and drop files';
	div.style.display = 'flex';
	document.getElementById('uploadContainer').appendChild(div);
	document.getElementById('maxFileSize').innerHTML = 'Maximum upload size per file is ' + upload.maxFileSize;
	
	axios.get(upload.api+'/upload?token='+upload.token)
	.then(function(response){
		upload.prepareDropzone(response.data.url);
	})
	.catch(function(error){
		swal('An error occured','There was an error with the upload server, please check the console for more information.','error');
		return console.log(error);
	});	
	
	if(!upload.isPrivate) {
		document.getElementById('loginToUpload').style.display = 'block'
	}
};

upload.prepareDropzone = function(uploadUrl){
	var previewNode = document.querySelector('#template');
	previewNode.id = '';
	var previewTemplate = previewNode.parentNode.innerHTML;
	previewNode.parentNode.removeChild(previewNode);

	var dropzone = new Dropzone('div#dropzone', { 
		url: uploadUrl,
		paramName: 'file',
		acceptedFiles: 'video/mp4',
		maxFilesize: upload.maxFileSize.slice(0, -2),
		parallelUploads: 2,
		uploadMultiple: false,
		previewsContainer: 'div#uploads',
		previewTemplate: previewTemplate,
		createImageThumbnails: false,
		maxFiles: 10,
		autoProcessQueue: true,
		headers: {
			'token': upload.token
		},
		init: function() {
			upload.myDropzone = this;
			this.on('addedfile', function(file) { 
				document.getElementById('uploads').style.display = 'block';
			});			
		}
	});
  
	// Update the total progress bar
	dropzone.on('uploadprogress', function(file, progress) {
		file.previewElement.querySelector('.progress').setAttribute('value', progress);
		file.previewElement.querySelector('.progress').innerHTML = progress + '%';
	});

	dropzone.on('success', function(file, response) {
		if (response.success) {
			a = document.createElement('a');
			a.href = response.url;
			a.target = '_blank';
			a.innerHTML = response.url;
			file.previewTemplate.querySelector('.link').appendChild(a);
			file.previewTemplate.querySelector('.progress').style.display = 'none';
		}
		else {
			var p = document.createElement('p');
			p.innerHTML = response.error;
			file.previewTemplate.querySelector('.link').appendChild(p);
		}		
	});
};

window.onload = function () {
	upload.sessionCheck();
};
