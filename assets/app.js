var upload = {}, ggApiAddr = '//api.giga.gs';

upload.isPrivate = true;
upload.token = localStorage.token;
upload.maxFileSize;
upload.myDropzone;

upload.sessionCheck = function(){
	axios.get(ggApiAddr + '/sessionCheck')
	.then(function (response) {
		upload.isPrivate= response.data.private;
		upload.maxFileSize = response.data.maxFileSize;
		upload.preparePage();
	})
	.catch(function (error) {
		swal("An error ocurred", 'There was an error with the request, please check the console for more information.', "error");
		return console.log(error);
	});
}

upload.preparePage = function(){
	if(!upload.isPrivate) return upload.prepareUpload();
	if(!upload.token) return document.getElementById('loginToUpload').style.display = 'inline-flex';
	upload.verifyToken(upload.token, true);
};

upload.verifyToken = function(token, reloadOnError){
	if(reloadOnError === undefined)
		reloadOnError = false;
	
	axios.post(ggApiUrl + '/token/verify', {
		token: token
	})
	.then(function (response) {
		if(response.data.success === false){
			swal({
				title: "An error ocurred", 
				text: response.data.description, 
				type: "error"
			}, function(){
				if(reloadOnError){
					localStorage.removeItem("token");
					location.reload();
				}
			});
			return;
		}

		localStorage.token = token;
		upload.token = token;
		return upload.prepareUpload();

	})
	.catch(function (error) {
		swal("An error ocurred", 'There was an error with the request, please check the console for more information.', "error");
		return console.log(error);
	});

};

upload.prepareUpload = function(){
	div = document.createElement('div');
	div.id = 'dropzone';
	div.innerHTML = 'Click here or drag and drop files';
	div.style.display = 'flex';

	document.getElementById('maxFileSize').innerHTML = 'Maximum upload size per file is ' + upload.maxFileSize;
	document.getElementById('loginToUpload').style.display = 'none';
	
	if(upload.token === undefined) 
		document.getElementById('loginLinkText').innerHTML = 'Create an account and keep track of your uploads';
    document.getElementById('uploadContainer').appendChild(div);
		upload.prepareDropzone();
};

upload.prepareDropzone = function(){
	var previewNode = document.querySelector('#template');
	previewNode.id = '';
	var previewTemplate = previewNode.parentNode.innerHTML;
	previewNode.parentNode.removeChild(previewNode);

	var dropzone = new Dropzone('div#dropzone', { 
		url: ggApiUrl + '/upload',
		paramName: 'files[]',
		maxFilesize: upload.maxFileSize.slice(0, -2),
		parallelUploads: 2,
		uploadMultiple: false,
		previewsContainer: 'div#uploads',
		previewTemplate: previewTemplate,
		createImageThumbnails: false,
		maxFiles: 1000,
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
		// Handle the responseText here. For example, add the text to the preview element:
		if (response.success === false) {
			var p = document.createElement('p');
			p.innerHTML = response.description;
			file.previewTemplate.querySelector('.link').appendChild(p);
		}

		if (response.files[0].url) {
			a = document.createElement('a');
			a.href = response.files[0].url;
			a.target = '_blank';
			a.innerHTML = response.files[0].url;
			file.previewTemplate.querySelector('.link').appendChild(a);
			file.previewTemplate.querySelector('.progress').style.display = 'none';
		}
		
	});
};

window.onload = function () {
	upload.sessionCheck();
};
