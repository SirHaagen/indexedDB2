
const formData= document.querySelectorAll("#data-input input");

const form= document.getElementById("data-input");

const formName= document.getElementById("name");
const formAge= document.getElementById("age");
const formEmail= document.getElementById("email");
const buttonCreate= document.querySelector(".form-create");
const buttonRead= document.querySelector(".form-read");
const buttonUpdate= document.querySelector(".form-update");
const buttonDelete= document.querySelector(".form-delete");

const data= document.querySelector(".data");
const dataEdit= document.querySelector(".data-edit");
const dataDelete= document.querySelector(".data-delete");

let numberTemp= "";
let keyTemp= 0;


const openRequest= indexedDB.open("universityStudentsDB",1);

openRequest.addEventListener("upgradeneeded",()=>{
  let db= openRequest.result;
  let store= db.createObjectStore("students",{autoIncrement: true});
  store.createIndex("index_age", "age");
  store.createIndex("index_email", "email", {unique: true});
})

openRequest.addEventListener("success", ()=>{
  console.log("Object Store created succesfully");
  readObjects();
})

openRequest.addEventListener("error", e=>{
  console.log(e);
})


//!-----------------------ADD HTML INFORMATION


let addHeader= ()=>{
  data.innerHTML= `
    <div class="thead name">Name</div>
    <div class="thead age">Age</div>
    <div class="thead email">Email</div>
    <div class="thead edit">Edit</div>
    <div class="thead delete">Delete</div>
  `  
}
let addHTML= (key, object)=>{

    let htmlName= document.createElement("div");
    let htmlAge= document.createElement("div");
    let hmtlEmail= document.createElement("div");
    let hmtlEdit= document.createElement("i");
    let htmlDelete= document.createElement("i");
    htmlName.classList.add("data-name");
    htmlAge.classList.add("data-age");
    hmtlEmail.classList.add("data-email");
    hmtlEdit.classList.add("data-edit");
    hmtlEdit.classList.add("fa-regular");
    hmtlEdit.classList.add("fa-pen-to-square");
    hmtlEdit.setAttribute("id",key);
    htmlDelete.classList.add("data-delete");
    htmlDelete.classList.add("fa-regular");
    htmlDelete.classList.add("fa-trash-can");
    htmlName.textContent= `${object.name}`;
    htmlAge.textContent= `${object.age}`;
    hmtlEmail.textContent= `${object.email}`;

    hmtlEdit.addEventListener("click", ()=>{
      key= hmtlEdit.getAttribute("id");
      getObject(key, object);
    })

    htmlDelete.addEventListener("click", ()=>{
      key= hmtlEdit.getAttribute("id");
      deleteFunction(key);
    })

    data.appendChild(htmlName);
    data.appendChild(htmlAge);
    data.appendChild(hmtlEmail);
    data.appendChild(hmtlEdit);
    data.appendChild(htmlDelete);

}


//!-----------------------CRUD PROCESS


let createObject= object=>{  
  
  let db= openRequest.result;
  const newTransaction= db.transaction("students", "readwrite");
  const store= newTransaction.objectStore("students");
  let request= store.add(object);

  request.addEventListener("success", ()=>{
    console.log("Object added succesfully");
    addHTML(request.result, object); //!add html row with data
    setTimeout(()=>swal.fire({title: "Information created succesfully", confirmButtonColor: "#1a1d38", timer: 2000, timerProgressBar: true}),500);
    form.reset(); //Clear the form
  })

  request.addEventListener("error", e=>{
    setTimeout(()=>swal.fire({title: "email already exists, please check the information and try again", confirmButtonColor: "#1a1d38", timer: 3000, timerProgressBar: true}),500);
    console.error(e);
  })

  request.addEventListener("complete", ()=>{
    db.close();
  })

}

let readObjects= ()=>{

  data.textContent= "";
  addHeader();
  let db= openRequest.result;
  const newTransaction= db.transaction("students", "readonly");
  const store= newTransaction.objectStore("students");

  const cursor= store.openCursor();

  cursor.addEventListener("success", ()=>{
    if(cursor.result){
      addHTML(cursor.result.key, cursor.result.value);
      cursor.result.continue();
    }
    setTimeout(()=>swal.fire({title: "Table updated succesfully", confirmButtonColor: "#1a1d38", timer: 2000, timerProgressBar: true}),500);
  })

  cursor.addEventListener("error", e=>{
    console.error(e);
  })

  cursor.addEventListener("complete", ()=>{
    db.close();
  })

}

let getObject= (key, object)=>{
  //Fill the form with the info selected to edit

  formName.value= object.name;
  formAge.value= object.age;
  formEmail.value= object.email;
  keyTemp= key;
}

let updateObject= (key, object)=>{

  let db= openRequest.result;
  const newTransaction= db.transaction("students", "readwrite");
  const store= newTransaction.objectStore("students");

  request= store.put(object, key);

  request.addEventListener("success", ()=>{
    console.log("object updated succesfully");
    form.reset(); //Clear the form
    setTimeout(()=>swal.fire({title: "Information updated succesfully", confirmButtonColor: "#1a1d38", timer: 2000, timerProgressBar: true}),500);
    keyTemp= 0;
    readObjects();
  })

  request.addEventListener("error", e=>{
    console.error(e);
  })

  request.addEventListener("complete", ()=>{
    db.close();
  })

}

let deleteFunction= (data)=>{

  if(data== "all"){
    swal.fire({title: "Are you sure you want to completely delete the information?",showCancelButton: true, confirmButtonText: 'Yes, delete it!', cancelButtonText: 'No, cancel!', confirmButtonColor: "#ee4527", cancelButtonColor: "#1a1d38"})
    .then(result=>{
      if(result.isConfirmed){
        let db= openRequest.result;
        const newTransaction= db.transaction("students", "readwrite");
        const store= newTransaction.objectStore("students");
        request= store.clear();
        request.addEventListener("success", ()=>{
          readObjects();
          setTimeout(()=>swal.fire({title: "Information deleted succesfully", confirmButtonColor: "#1a1d38", timer: 2000, timerProgressBar: true}),500);
        })
      }
    })
  }

  else{
    let db= openRequest.result;
    const newTransaction= db.transaction("students", "readwrite");
    const store= newTransaction.objectStore("students");
    const key= parseInt(data);
    request= store.delete(key);
    request.addEventListener("success", ()=>{
      setTimeout(()=>swal.fire({title: "Information deleted succesfully", confirmButtonColor: "#1a1d38", timer: 2000, timerProgressBar: true}),500);
      readObjects();

      request.addEventListener("error", e=>{
        console.error(e);
      })    
      request.addEventListener("complete", ()=>{
        db.close();
      })
    })
  }

}


//!----------------------------PRELIMINARY VALIDATIONS


let numbers= ()=>{
  let numberOk= /^[\d]+$/;
  if(formAge.value.match(numberOk)==null) formAge.value= numberTemp;
  else numberTemp= formAge.value; 
}

let formValidation= (mode)=>{

  let allData= Array.from(formData).reduce((acc,input)=>({...acc,[input.id]: input.value}),{})
  let name= allData.name;
  let age= allData.age;
  let email= allData.email;

  let wrong= ["", " ", null, undefined];

  if(wrong.includes(name) || wrong.includes(age) || wrong.includes(email)){
    setTimeout(()=>swal.fire({title: "Please, complete all the information", confirmButtonColor: "#1a1d38", timer: 2000, timerProgressBar: true}),500);
  return
}
  //When the info is ok, check if its either add mode or modify mode selected
  mode== 1 ? createObject(allData) : updateObject(key, allData);

}


//!----------------------------EVENTS

formAge.addEventListener("keyup", numbers);
formAge.addEventListener("keydown",(e)=>{
  if(e.key== 'Backspace') numberTemp= formAge.value.substring(0, formAge.value.length - 1);
});

formEmail.addEventListener("blur", ()=>{
  if(!formEmail.value.match(/[^@\s]+\@[^@\s]+\.[^@\s]+/)){
    swal.fire("Incorrect Email, try again");
    formEmail.value= '';
  } 
})

buttonCreate.addEventListener("click", e=>{
  e.preventDefault();
  if(keyTemp != 0) setTimeout(()=>swal.fire({title: "Please click on Update button to proceed", confirmButtonColor: "#1a1d38", timer: 2000, timerProgressBar: true}),500);
  formValidation(1);
}) 

buttonUpdate.addEventListener("click", e=>{
  e.preventDefault();
  key= parseInt(keyTemp);
  formValidation(2);
}) 

buttonRead.addEventListener("click", e=>{
  e.preventDefault();
  readObjects();
})

buttonDelete.addEventListener("click", e=>{
  e.preventDefault();
  deleteFunction("all");
})