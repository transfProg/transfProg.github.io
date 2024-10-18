





















//CONVERTS######################################

let base64String = ''; 
let nameStr =""

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            resolve(event.target.result); 
        };

        reader.onerror = function(error) {
            reject(error);
        };

        reader.readAsDataURL(file); 
    });
}
function base64ToBlob(base64Data) {
    if (!base64Data || typeof base64Data !== 'string' || !base64Data.includes(',')) {
        console.error('Invalid Base64 string.');
        return null;
    }
    const base64String = base64Data.split(',')[1];
    const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
    
    try {
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeString });
    } catch (error) {
        console.error("Error decoding Base64:", error);
        return null;
    }
}

const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', onConvert)

async function onConvert(){
    const file = fileInput.files[0];  

    if (file) {
        try {
            base64String = await fileToBase64(file); 
            nameStr = file.name

            console.log(base64String.length)
            sendFile(base64String,nameStr)
        } catch (error) {
            console.error('Error converting file to Base64:', error);
        }
    } else {
        alert('Please select a file.');
    }
}

//SEND############################

async function sendFile(file,name){
    let ids=[]
    let slider = document.getElementById("slider-load")
    slider.style.width = "0px"
    for (let i = 0; i < file.length/90000; i++) {
        let str = file.slice(i*90000,i*90000+90000)
        await prom(i+name,str).then(
            function(result){
                ids.push(result)
                slider.style.width = (i/(file.length/90000))*200+"px"
        })
    }
    await prom(name,ids).then(function(rs){
        shortenURL("https://transfProg.io/"+rs).then(res=>{
            document.getElementById("codeView").textContent = res
            slider.style.width = "200px"
        })
    })
}

function prom(name,str){
    return new Promise(function(resolve,reject){
        sendPostRequest(name,str).then(result => {
            resolve(result.metadata.id)
            }).catch(error => {
            reject(error)
            }); 
    })
}

async function sendPostRequest(name,str) {
    try {
        const response = await $.ajax({
            url: "https://api.jsonbin.io/v3/b",  
            type: 'POST',                          
            headers: {
                "X-Access-Key": "$2a$10$4WIhpdrN7uBpEpR2RX4hHst59HJNkbeGYxRYe4Y6tCkc1fcJzQDLq",  
                "X-Collection-Id": "6707c9cfacd3cb34a8948bd3",
                "X-Master-Key":"$2a$10$E8NZBoGEhvImENDO9hyWX.TIhC6.HrGpFhbJfS9NZ7qPnBs4kUHDO",
                "Content-Type": 'application/json',
            },
            contentType: 'application/json',        
            data: JSON.stringify({                  
                name: name,
                content: str
            }),
        
        });
      

        console.log('Response:', response);
        return response;  
    } catch (error) {
        console.error('Error:', error);  
        throw error;                     
    }
}

async function shortenURL(longUrl) {
    try {
        var response = await $.ajax({
            url: `https://api.tinyurl.com/create`,
            method: 'POST',
            headers: {
                'Authorization': 'Bearer A2UEVlWeECzF2d7NPzlzGuadcxbmtwjFPIvkBf1fADNfqlXfhPTnUegnHAHX',  // Replace with your actual API key
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                url: longUrl,
                domain: 'tiny.one'  
            }),
            contentType: 'application/json',
            
            
        });
        console.log(response.data)
        const shortenedURL = response.data.alias;
        return shortenedURL
    } catch (error) {
        console.error('Error shortening URL:', error);
        throw error 
    }
    
}

//GET#######################

const codeInput = document.getElementById('codeInput');
document.getElementById('codeBtn').addEventListener("click",getFile);

async function getFile(){
    let slider = document.getElementById("slider-load")
    slider.style.width = "0px"
    if (codeInput.value=="") {
        return console.log("ERROR CODE")
    }
    let listL = null
    await getLinkfromCode(codeInput.value).then(res=>{listL = res})
    let mainCode = null
    let nameCode = ""
    await getBase64(listL).then(res=>{mainCode=res[0];nameCode=res[1]})

    let base64Data = ''
    for(const i in mainCode){
        await getBase64(mainCode[i]).then(res=>{base64Data=base64Data+res[0]; slider.style.width = (i/mainCode.length)*200+"px"})
    }
    slider.style.width = "200px"
    downloadFile(base64ToBlob(base64Data),nameCode)


}


async function getLinkfromCode(shortUrl){
    try {
        var response = await $.ajax({
            url: `https://api.tinyurl.com/alias/tiny.one/`+shortUrl,
            method: 'GET',
            headers: {
                'Authorization': 'Bearer A2UEVlWeECzF2d7NPzlzGuadcxbmtwjFPIvkBf1fADNfqlXfhPTnUegnHAHX',  // Replace with your actual API key
                'Content-Type': 'application/json'
            },
            
        })
        console.log(response)
        return response.data.url.split("/").pop()
    } catch (error) {
        throw error
    }
    
}

async function getBase64(code){
    try {
        var response = await $.ajax({
            url: "https://api.jsonbin.io/v3/b/"+code,
            method: 'GET',
            headers: {
                "X-Access-Key": "$2a$10$4WIhpdrN7uBpEpR2RX4hHst59HJNkbeGYxRYe4Y6tCkc1fcJzQDLq",  
                "X-Collection-Id": "6707c9cfacd3cb34a8948bd3",
                "X-Master-Key":"$2a$10$E8NZBoGEhvImENDO9hyWX.TIhC6.HrGpFhbJfS9NZ7qPnBs4kUHDO",
                "Content-Type": 'application/json',
            },
        })
        console.log(response)
        return [response.record.content,response.record.name]
    } catch (error) {
        throw error
    }

}

function downloadFile(blob, fileName) {
    if (!blob) {
        alert("Failed to convert Base64 to a valid file.");
        return;
    }
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);  
    link.click();                    
    document.body.removeChild(link);  
    URL.revokeObjectURL(url);        
}

