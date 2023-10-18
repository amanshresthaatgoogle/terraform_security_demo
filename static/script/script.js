var valueSelected = "Terraform 1"

var question = ""

messages = [
    {
        'sender' : 'AI',
        'message' : 'hello'
    },
    {
        'sender' : 'User',
        'message' : 'Hi there'
    }
]

document.addEventListener("DOMContentLoaded",  
function () { 

    document.querySelector('#terraform_option').innerText = valueSelected;
    const input = document.getElementById("questionBox");

    const architecture_1 = document.querySelector('#architecture_1');
    const architecture_2 = document.querySelector('#architecture_2');
    const architecture_3 = document.querySelector('#architecture_3');
    architecture_1.style.visibility = "visible";
    architecture_2.style.visibility = "collapse";
    architecture_3.style.visibility = "collapse";

    input.addEventListener("keyup", function (e) {
        if (e.code === "Enter") {  //checks whether the pressed key is "Enter"
            submitQuestion()
        }else{
            question = e.target.value;
        }
    });

}); 

function updateChat(newMessage){
    const listOfMessage = document.getElementById("messages");
    console.log(listOfMessage);

    var li = document.createElement("li");
    li.appendChild(document.createTextNode(newMessage));
    listOfMessage.appendChild(li);
    

}


function changeOption(value) {
    valueSelected = value
    document.querySelector('#terraform_option').innerText = valueSelected;

    const architecture_1 = document.querySelector('#architecture_1');
    const architecture_2 = document.querySelector('#architecture_2');
    const architecture_3 = document.querySelector('#architecture_3');
    architecture_1.style.visibility = "collapse";
    architecture_2.style.visibility = "collapse";
    architecture_3.style.visibility = "collapse";
    if(valueSelected === "Terraform 1"){
        architecture_1.style.visibility = "visible";
    }else if(valueSelected === "Terraform 2"){
        architecture_2.style.visibility = "visible";
    }else{
        architecture_3.style.visibility = "visible";
    }
}


async function submitQuestion() {
    console.log('Make post request')
    updateChat(question)
   

    var input = document.getElementById("questionBox");
    


    try {
        const request = {
            terraform_example: valueSelected,
            prompt: question
        }
        const response = await axios.post(`/postchat`, request);
        console.log(response);
        const message_received = response.data["message"]["candidates"][0].text;
        updateChat(message_received);
        
        console.log(`Added a new Todo!`, response);

        question = ""
        input.value="";

      } catch (errors) {
        console.error(errors);
      }
   
}


