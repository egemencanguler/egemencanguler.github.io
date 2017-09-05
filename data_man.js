var data = {};


data.save = function()
{
	data.experiment = experiment.data;
	data.calibration = calibration.data;

	var str = JSON.stringify(data);

    //Save the file contents as a DataURI
    var dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(str);
    document.getElementById("image").style.display = "none";

    var textToSave = str
    var textToSaveAsBlob = new Blob([textToSave], {type:"text/plain"});
    var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
    var fileNameToSaveAs = "result.json";
 
    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = textToSaveAsURL;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
 
    downloadLink.click();

}


