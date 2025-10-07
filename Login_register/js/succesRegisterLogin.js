const button = document.querySelector("#actionButton")
const form = document.querySelector('#form')
console.log(button)


form.addEventListener("submit", (event)=>{
    event.preventDefault();

    button.classList.add("loading");
    button.innerHTML=""

    setTimeout(()=>{
        button.classList.remove("loading");
        button.classList.add("success");

        setTimeout(()=>{
            window.location.href = "/home/index.html"
        },500)
    },1000)

    
})
