const template = document.createElement('template');
template.innerHTML = `
<style>
:host {
  font-size: 13px;
  font-family: arial;
  overflow: auto;
}
</style>
<section hidden>
<article>
  <label for="fileUpload">Upload</label>
 
    <span></span><button id="remove">Remove</button>

</article>
<input hidden id="fileUpload" type="file" accept=".csv,.txt" />
</section>
`;

class UploadFileSimple extends HTMLElement{
    constructor(){
        super();

        //HTML objects
        this.attachShadow({mode:'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this._input = this.shadowRoot.querySelector('input');
        this._remove = this.shadowRoot.querySelector('#remove');
  
        //CSV related objects
        this._data=null; //holds JSON Array returned from CSV file
    }

    /**
     * This method displays the file selector to the end-user by executing the click event on the HTML object stored in the this._input variable
     * The rest of the upload is handled in the onChange() event of the input control stored in the connectedCallback() function. The onChange() event
     * calls the loadCSV() function and passes in the CSV file as a parameter
     */
    showFileSelector(){
        //this.handleRemove();
        console.log("In ShowFileSelector()");
        this._input.click();
    }

    //retrieve the data in the CSV file
    getData(){
        return this._data;
    }

    /**
     * 
     * @param {Event} e - the Event object that holds the CSV file the user selected
     * 
     * This function uses a FileReader object to read in the file as a String object
     * it then passes this String to the csvToArray() function to parse into an Array of JSON Objects
     * 
     * 
     */
     loadCSV(e) {
        //sometimes SAC will make multiple calls to the CustomWidget when it is nested in a popup window. This logic prevents it from being called multiple times
        if(this._previousEvent!=e){
            this._previousEvent=e;
            const file = e.target.files[0];
            //this.dispatch('change', file);
            this._dimsInCSV=[]; //reset dimension array
            let temp = this; //assign global this to temp to help with scoping references 

            const reader = new FileReader();
    
            reader.onload = function (e) {
                const text = e.target.result;

                //retrieve JSON Array from CSV string
                const data = temp.csvToArray(text);

                //store JSON Array as a global variable
                temp.setData(data);
                temp.handleRemove();
                temp.dispatch('onFileUpload');
            };
                
            reader.readAsText(file);
        }
    }


    /**
     * 
     * @param {Object[]} newData - JSON array
     * 
     * sets the data returned from the CSV into a global variable
     */
    setData(newData){
        this._data=newData;
    }

     //convert the CSV data to an array
    csvToArray(csv){
        var lines=csv.split("\n");

        var result = [];
        
        //regex
        var commaRegex = /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/g
        var quotesRegex =/\"/g
        var crRegex = /\r/g

        var headers = lines[0].split(commaRegex).map(h => h.replace(quotesRegex, "").replace(crRegex,""));

        for(var i=1;i<lines.length;i++){
            var obj = {};
            var currentline=lines[i].split(commaRegex);

            //handle empty lines at end of CSV
            if(currentline.length==headers.length){
                for(var j=0;j<headers.length;j++){
                    var newValue= currentline[j].replace(quotesRegex, "");
                    obj[headers[j]] = newValue.replace(crRegex, "");

                }
                result.push(obj);
            }
            
        }
        return result;
    }


   //events

    //triggered when a user removes the CSV file
    handleRemove() {
        const el = this._input;
        const file = el.files[0];
        el.value = "";
        //this.select('section').style.display = "none";
        this.dispatch('change', file);
    }

      
    dispatch(event, arg) {
      this.dispatchEvent(new CustomEvent(event, {detail: arg}));
    }


    /**
     * standard Web Component function used to add event listeners
     */
    connectedCallback(){
        this._input.addEventListener('change',(e)=>this.loadCSV(e));
        this._remove.addEventListener('click',()=>this.handleRemove());
      
    }

}

window.customElements.define('com-sap-sample-uploadfilesimple',UploadFileSimple);