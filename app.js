// Selectors and Variables...
let colors=[];
const colordivs = document.querySelectorAll(".color");
const generateButton = document.querySelector(".generate-btn");
const rangeInputs = document.querySelectorAll("input[type='range']");
const hexestext = document.querySelectorAll(".color h2");
const adjustDivs = document.querySelectorAll(".adjustments");
const closeAdjustBtn = document.querySelectorAll(".close-adj");
const adjustBtn = document.querySelectorAll(".adjust")
const lockBtn = document.querySelectorAll(".lock");
const saveBtn = document.querySelector(".save-btn");
const closeSaveBtn = document.querySelector(".close-save-btn");
const savePaletteBtn = document.querySelector(".save-submit-btn");
const libraryBtn = document.querySelector(".library-btn");
const closeLibBtn = document.querySelector(".close-lib-btn");
const libraryContainer = document.querySelector(".library-container")
let savedPalettes=[];

// functions

//color generator
function generateColor(){
    const randomColor =chroma.random() ;
    return randomColor;
}

//fill Divs with random colors
function randomDivColors(){
    colordivs.forEach( (div,index) =>{
        const color = generateColor();
        if(div.classList.contains("locked")){
            colors.push(div.children[0].innerText);
            return;
        }else{
            colors.push(chroma(color).hex());
        }
        const icons = div.querySelectorAll(".controls button");
        div.children[0].innerText = color;
        div.style.backgroundColor = color;
        contrastChecker(color,div.children[0]);
        const inputs = div.querySelectorAll("input[type='range']");
        // console.log(inputs);
        const hueInputs =inputs[0];
        const brightnessInputs = inputs[1];
        const saturationInputs = inputs[2];
        colorizeInputs(color,hueInputs,brightnessInputs,saturationInputs);
        for(icon of icons){
            contrastChecker(color,icon);
        }
    });
    resetInputs();
}
//contrast adjusting according to color generated...(icons,text)...

function contrastChecker(color,text){
    const contrast = chroma(color).luminance();
    if (contrast > 0.5){
        text.style.color = "black";
    }else{
        text.style.color = "white";
    }
}
//adding colors to range inputs...
function colorizeInputs(color,hue,brightness,saturation){
    //saturation scale
    const noSat = color.set("hsl.s",0);
    const  fullSat = color.set("hsl.s",1)
    const satScale = chroma.scale([noSat,color,fullSat]);
    //styling Saturation inputs
    saturation.style.backgroundImage = `linear-gradient(to right,${satScale(0)},${satScale(0.5)},${satScale(1)})`;
    //Brightness mid
    const brightMid = color.set("hsl.l",0.5);
    //Brightness Scale
    const brightScale = chroma.scale(["black",brightMid,"white"]);
    brightness.style.backgroundImage = `linear-gradient(to right,${brightScale(0)},${brightScale(0.5)}, ${brightScale(1)})`;
    //hue scale
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;

}
function inputController(e){
    const data = e.target.getAttribute("data-hue") || e.target.getAttribute("data-brightness") ||e.target.getAttribute("data-saturation");
    const sliders = e.target.parentElement.querySelectorAll("input[type='range']");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];
    const divBgColor = colors[data];
    let color;
    color = chroma(divBgColor).set("hsl.h",hue.value).set("hsl.s",saturation.value).set("hsl.l",brightness.value);
    colordivs[data].style.backgroundColor = color.hex();
    colorizeInputs(color,hue,brightness,saturation);
}
//updating color text ...

function updateUiText(index){
    const hexText =chroma(colordivs[index].style.backgroundColor);
    const color = hexText.hex()
    colordivs[index].querySelector("h2").innerText = color;
    const icons = colordivs[index].querySelectorAll(".controls button");
    contrastChecker(hexText,colordivs[index].querySelector("h2"));
    icons.forEach(icon=>{
        contrastChecker(hexText,icon);
    });
    
    
}
//coloring range inputs...
function resetInputs(){
    const inputs = document.querySelectorAll(".adjustments input")
    for(input of inputs){
        if(input.name ==="hue-inp"){
            const hueColor = colors[input.getAttribute("data-hue")];
            const hueValue = chroma(hueColor).hsl()[0];
            input.value = hueValue;
        }
        if(input.name ==="brightness-inp"){
            const brightColor = colors[input.getAttribute("data-brightness")];
            const brightValue = chroma(brightColor).hsl()[2];
            console.log()
            input.value =Math.floor(brightValue * 100)/100;
        }
        if(input.name ==="saturation-inp"){
            const satColor = colors[input.getAttribute("data-saturation")];
            const satValue = chroma(satColor).hsl()[1];
            input.value =Math.floor(satValue * 100)/100;
        }
    }
}
//Copying color Hex to ClipBoard...

function toClipBoard(hex){
    const textArea = document.createElement("textarea");
    textArea.value =hex.innerText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea); 
}
//lock a color while generating other colors ...
 function lockColor(e,index){
    const btnLock = e.target.children[0];
    const  activeDiv = colordivs[index];
     activeDiv.classList.toggle("locked")
     if(btnLock.classList.contains("fa-lock-open")){
         e.target.children[0].classList.replace("fa-lock-open","fa-lock");
     }else{
        e.target.children[0].classList.replace("fa-lock","fa-lock-open");
     }
 }
 function openSave(e){
     const saveBox = document.querySelector(".save-container")
     saveBox.classList.add("active");
     saveBox.children[0].classList.add("active");
 }
 function closeSave(){
    const saveBox = document.querySelector(".save-container")
    saveBox.classList.remove("active");
    saveBox.children[0].classList.remove("active");
 }
//generating saved palettes preview in Library popup...
 function savePalettes(){
    const saveBox = document.querySelector(".save-container")
     let paletteObj;
     const saveInput = saveBox.querySelector(".save-inp");
     let name  = saveInput.value;
     saveInput.value="";
     const localPalettes = JSON.parse(localStorage.getItem("palettes"))
     let palettesNr;
     if(localPalettes){
        palettesNr =localPalettes.length;
    }else{
        palettesNr = savedPalettes.length;
    }
     paletteObj = {name,colors,Nr:palettesNr};
     savedPalettes.push(paletteObj);
     savetoLocal(paletteObj);
     //Generate Local Palettes...
     const localPalette = document.createElement("div");
     localPalette.classList.add("costume-palette");
     const paletteTitle = document.createElement("h4");
     paletteTitle.innerText = paletteObj.name;
     const smallPreview = document.createElement("div");
     smallPreview.classList.add("preview");
     paletteObj.colors.forEach(color =>{
         const colorPreview = document.createElement("div");
         colorPreview.style.backgroundColor = color;
         smallPreview.appendChild(colorPreview);
     });
     const selectPaletteBtn = document.createElement("button");
     selectPaletteBtn.classList.add("pick-palette-btn");
     selectPaletteBtn.classList.add(paletteObj.Nr);
     selectPaletteBtn.innerText = "Select";

    selectPaletteBtn.addEventListener("click",e =>{
        closeLibrary()
        const paletteIndex = e.target.classList[1];
        colors =[];
        savedPalettes[paletteIndex].colors.forEach((color,index) =>{
            colors.push(color);
            colordivs[index].style.backgroundColor = color;
            const text = colordivs[index].children[0];
            contrastChecker(color,text);
            updateUiText(index); 
        });
        resetInputs()
    })

     localPalette.appendChild(paletteTitle);
     localPalette.appendChild(smallPreview);
     localPalette.appendChild(selectPaletteBtn);
     libraryContainer.children[0].appendChild(localPalette)

    closeSave()
    }

    // Saving palettes to localStorage...

function savetoLocal(paletteObj){
    let localPalette;
    if(localStorage.getItem("palettes") ===null){
        localPalette =[];
    }else{
        localPalette = JSON.parse(localStorage.getItem("palettes"));
    }
    localPalette.push(paletteObj);
    localStorage.setItem("palettes",JSON.stringify(localPalette));

}

function openLibrary(){
    const libBox = document.querySelector(".library-container");
    libBox.classList.add("active");
    libBox.children[0].classList.add("active");
}

function closeLibrary(){
    const libBox = document.querySelector(".library-container");
    libBox.children[0].classList.remove("active");
    libBox.classList.remove("active");
}
//Getting palettes from localStorage
function getFromLocal(){
    let localPalettes;
    if(localStorage.getItem("palettes")===null){
        localPalettes = [];
    }else{
        let localObjects = JSON.parse(localStorage.getItem("palettes"));
        savedPalettes = [...localObjects];
        localObjects.forEach(paletteObj =>{
              //Generate Local Palettes...
     const localPalette = document.createElement("div");
     localPalette.classList.add("costume-palette");
     const paletteTitle = document.createElement("h4");
     paletteTitle.innerText = paletteObj.name;
     const smallPreview = document.createElement("div");
     smallPreview.classList.add("preview");
     paletteObj.colors.forEach(color =>{
         const colorPreview = document.createElement("div");
         colorPreview.style.backgroundColor = color;
         smallPreview.appendChild(colorPreview);
     });
     const selectPaletteBtn = document.createElement("button");
     selectPaletteBtn.classList.add("pick-palette-btn");
     selectPaletteBtn.classList.add(paletteObj.Nr);
     selectPaletteBtn.innerText = "Select";

    selectPaletteBtn.addEventListener("click",e =>{
        closeLibrary()
        const paletteIndex = e.target.classList[1];
        colors =[];
        localObjects[paletteIndex].colors.forEach((color,index) =>{
            colors.push(color);
            colordivs[index].style.backgroundColor = color;
            const text = colordivs[index].children[0];
            contrastChecker(color,text);
            updateUiText(index); 
        });
        resetInputs()
    })

     localPalette.appendChild(paletteTitle);
     localPalette.appendChild(smallPreview);
     localPalette.appendChild(selectPaletteBtn);
     libraryContainer.children[0].appendChild(localPalette)

    closeSave()

        })
    }

}
//Events Listeners
document.addEventListener("DOMContentLoaded",randomDivColors);
generateButton.addEventListener("click",()=>{
    colors=[];
    randomDivColors();
    resetInputs();
});

closeAdjustBtn.forEach(btn =>{
    btn.addEventListener("click",()=>{
        const parent = btn.parentElement;
        btn.parentElement.classList.remove("active");
    });
});


adjustBtn.forEach((btn,index)=>{
    btn.addEventListener("click",()=>{
        adjustDivs[index].classList.toggle("active");
    })
})

rangeInputs.forEach(input =>{
    input.addEventListener("input",(e)=>{
        inputController(e)
    });
});
colordivs.forEach((div,index)=>{
    div.addEventListener("change",()=>{
        updateUiText(index);
    });
    const hexText = div.querySelector("h2");
    const clipDiv = document.querySelector(".clipboard-container");
    hexText.addEventListener("click",(e) =>{
        toClipBoard(e.target);
        clipDiv.classList.add("active");
        clipDiv.children[0].classList.add("active");
    })
    clipDiv.addEventListener("transitionend",()=>{
        clipDiv.children[0].classList.remove("active");
        clipDiv.classList.remove("active");

    })

});
lockBtn.forEach((btn,index) =>{
    btn.addEventListener("click",e =>{
        // console.log(btn.children[0]);
        lockColor(e,index);
    });
});
//save popup event listeners
saveBtn.addEventListener("click",openSave);
closeSaveBtn.addEventListener("click",closeSave);
//Library event listeners...
libraryBtn.addEventListener("click",openLibrary);
closeLibBtn.addEventListener("click",closeLibrary);

//Local storage event listeners...

savePaletteBtn.addEventListener("click",savePalettes);
document.addEventListener("DOMContentLoaded",getFromLocal)