let modeBtn = document.querySelector("#mode");
let heading = document.querySelector(".heading");
let currMode = "light";

modeBtn.addEventListener("click", () => {
    if(currMode === "light"){
        currMode = "dark";
        document.body.style.backgroundColor = "black";
        heading.style.color = "white";
        modeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }else{
        currMode = "light";
        document.body.style.backgroundColor = "white";
        heading.style.color = "black";
        modeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
});

