let newBtn = document.getElementById("newQuestion");
let searchBtn = document.getElementById("searchBtn");
let favouritBtn = document.getElementById("favourite");
let submitBtn = document.getElementById("submitButton");
let subjectInput = document.getElementById("subjectInput");
let questionInput = document.getElementById("questionInput");
let rightcontainer = document.getElementById("rightcontainer");
let rightpart = document.getElementById("rightpart");
let parent = document.getElementById("questionList");

let discussionData = JSON.parse(localStorage.getItem('discussionData')) || {};

let questionID = 0;
let responseID = 0;

// Load existing questions on page load
for (let key in discussionData) {
    let question = discussionData[key];

    if (question.id > questionID) {
        questionID = question.id;
    }
    
    if (!question.isdeleted) {
        displayOnUI(question);
    }
}

// Function to display question on the UI
function displayOnUI(question) {
    let el = document.createElement("div");
    el.className = "questionItem";
    el.dataset.questionId = question.id; // Store the question ID in the element

    let withouttime = document.createElement("div");
    withouttime.className = "withouttime";

    let data = document.createElement("span");
    data.className = "datapart";

    let icon = document.createElement('i');
    icon.className = question.isstar ? "fa-solid fa-star" : "fa-regular fa-star";
    icon.dataset.type = "star";  // Mark as a star icon

    let presub = document.createElement("h2");
    presub.className = "subelement";
    let preques = document.createElement("h4");
    preques.className = "queselement";

    presub.innerText = question.subject;
    preques.innerText = question.question;

    let timeLogged = document.createElement('span');
    timeLogged.className = "timeLogged";
    timeLogged.innerText = getTimeDifference(question.createdAt); // Set initial time

    data.appendChild(presub);
    data.appendChild(preques);

    withouttime.appendChild(data);
    withouttime.appendChild(icon);

    el.appendChild(withouttime);
    el.appendChild(timeLogged);

    parent.prepend(el);
}

// Function to calculate the time difference and return
function getTimeDifference(timestamp) {
    let now = Date.now();
    let diffInSeconds = Math.floor((now - timestamp) / 1000);

    if (diffInSeconds < 10) {
        return 'few seconds ago';
    }else if(diffInSeconds<60){
        return `${diffInSeconds} seconds ago`;
    }
    else if (diffInSeconds < 3600) {
        let minutes = Math.floor(diffInSeconds / 60);
        return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    } else if (diffInSeconds < 86400) {
        let hours = Math.floor(diffInSeconds / 3600);
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (diffInSeconds < 2592000) {
        let days = Math.floor(diffInSeconds / 86400);
        return days === 1 ? '1 day ago' : `${days} days ago`;
    } else if (diffInSeconds < 31536000) {
        let months = Math.floor(diffInSeconds / 2592000);
        return months === 1 ? '1 month ago' : `${months} months ago`;
    } else {
        let years = Math.floor(diffInSeconds / 31536000);
        return years === 1 ? '1 year ago' : `${years} years ago`;
    }
}

// Add new question when submit button is clicked
submitBtn.addEventListener('click', function () {
    let subjectValue = subjectInput.value.trim();
    let questionValue = questionInput.value.trim();

    if (subjectValue !== "" && questionValue !== "") {
        createQuestion(subjectValue, questionValue);
        subjectInput.value = "";
        questionInput.value = "";
    }
});

// Allow Enter key to submit the question
questionInput.addEventListener("keyup", function (event) {
    if (event.code === "Enter") {
        let subjectValue = subjectInput.value.trim();
        let questionValue = questionInput.value.trim();

        if (subjectValue !== "" && questionValue !== "") {
            createQuestion(subjectValue, questionValue);
            subjectInput.value = "";
            questionInput.value = "";
        }
    }
});

// Function to create a new question
function createQuestion(subject, questionText) {
    questionID++;
    let currentTime = Date.now(); // Store the current timestamp
    let question = {
        id: questionID,
        subject: subject,
        question: questionText,
        isdeleted: false,
        response: [],
        isstar: false,
        createdAt: currentTime // Store the creation time
    };
    discussionData[questionID] = question;

    displayOnUI(question);
    storedata(discussionData);
}

// Function to store data to localStorage
function storedata(newdata) {
    localStorage.setItem('discussionData', JSON.stringify(newdata));
}

// Add a general event listener to the parent container for question clicks
parent.addEventListener('click', function (event) {
    let target = event.target;
    
    if (target.dataset.type === "star") {
        let questionId = target.closest(".questionItem").dataset.questionId;
        let question = discussionData[questionId];

        // Toggle star status
        question.isstar = !question.isstar;
        target.className = question.isstar ? "fa-solid fa-star" : "fa-regular fa-star";
        updateInStorage(questionId, 1, question.isstar);
    }

    // If the question was clicked (excluding the star icon)    
    if (target.closest(".questionItem") && !target.dataset.type) {
        // console.log(target.closest(".questionItem"));
        let questionId = target.closest(".questionItem").dataset.questionId;
        let question = discussionData[questionId];

        rightcontainer.innerHTML = "";

        let selectedquestion = document.createElement('div');
        selectedquestion.className = 'selectedquestion';

        let questiontoshow = document.createElement('div');
        questiontoshow.className = 'questiontoshow';

        let title = document.createElement('h2');
        title.innerText = "Question";

        let subjectValue = document.createElement('h3');
        subjectValue.innerText = question.subject;

        let questionValue = document.createElement('div');
        questionValue.innerText = question.question;

        let removeBtn = document.createElement('button');
        removeBtn.className = 'removeBtn';
        removeBtn.innerText = 'Remove';

        removeBtn.addEventListener('click', function () {
            question.isdeleted = true;
            updateInStorage(questionId, 3);
            selectedquestion.remove(); // Remove from the UI

            // parent.querySelector(`[data-question-id="${questionId}"]`).remove(); // Remove from the question list
            parent.removeChild(target.closest(".questionItem"));
            rightpart.style.display = "block";
            rightcontainer.appendChild(rightpart);
        });

        questiontoshow.appendChild(title);
        questiontoshow.appendChild(subjectValue);
        questiontoshow.appendChild(questionValue);
        questiontoshow.appendChild(removeBtn);

        selectedquestion.appendChild(questiontoshow);

        // Response section
        let responsepart = document.createElement('div');
        responsepart.className = 'responsepart';

        let responsetitle = document.createElement('h2');
        responsetitle.innerText = "Responses";

        let responseList = document.createElement('div');
        responseList.className = 'responseList';

        // Display all responses
        const sortedResponses = sortResponses(question.response);
        sortedResponses.forEach((response) => {

            if (response.id > responseID) {
                responseID = response.id;
            }

            let responseItem = document.createElement('div');
            responseItem.className = 'responses';

            let responseDataPart = document.createElement('span');
            responseDataPart.className = "responseDataPart";

            let name = document.createElement('h3');
            name.className = "personname";
            name.innerText = response.name + ':';

            let comment = document.createElement('p');
            comment.className = 'personcomment';
            comment.innerText = response.comment;

            responseDataPart.appendChild(name);
            responseDataPart.appendChild(comment);

            let responseReactPart = document.createElement('span');
            responseReactPart.className = "responseReactPart";

            let responseLikePart = document.createElement('span');
            responseLikePart.className = "responseLikePart";

            let upvotesign = document.createElement('button');
            upvotesign.className = "upvotesign";
            upvotesign.innerText = "+";

            let upvotecount = document.createElement("span");
            upvotecount.className = "upvotecount";
            upvotecount.innerText = response.upvote;

            responseLikePart.appendChild(upvotesign);
            responseLikePart.appendChild(upvotecount);

            let responseDislikePart = document.createElement('span');
            responseDislikePart.className = "responseDislikePart";

            let downvotesign = document.createElement('button');
            downvotesign.className = "downvotesign";
            downvotesign.innerText = "-";

            let downvotecount = document.createElement("span");
            downvotecount.className = "downvotecount";
            downvotecount.innerText = response.downvote;

            responseDislikePart.appendChild(downvotesign);
            responseDislikePart.appendChild(downvotecount);

            responseReactPart.appendChild(responseLikePart);
            responseReactPart.appendChild(responseDislikePart);

            responseItem.appendChild(responseDataPart);
            responseItem.appendChild(responseReactPart);
            responseList.appendChild(responseItem);

            // Add event listeners for upvote and downvote buttons
            upvotesign.addEventListener('click', function () {
                response.upvote++;
                updateInStorage(questionId, 2, response);
                upvotecount.innerText = response.upvote;

                // Re-render the responses
                renderResponses(questionId);
            });

            downvotesign.addEventListener('click', function () {
                response.downvote++;
                updateInStorage(questionId, 2, response);
                downvotecount.innerText = response.downvote;

                // Re-render the responses
                renderResponses(questionId);
            });
        });

        responsepart.appendChild(responsetitle);
        responsepart.appendChild(responseList);

        let responseform = document.createElement('div');
        responseform.className = 'responseform';

        let responseformtitle = document.createElement('h2');
        responseformtitle.innerText = "Add new Responses";

        let responseinput = document.createElement('textarea');
        responseinput.className = 'responseinput';
        responseinput.placeholder = 'Add your response...';

        let nametag = document.createElement('input');
        nametag.className = 'nametag';
        nametag.placeholder = 'Your name';

        let submitresponse = document.createElement('button');
        submitresponse.className = 'submitresponse';
        submitresponse.innerText = 'Submit';

        submitresponse.addEventListener('click', function () {
            let responseText = responseinput.value.trim();
            let name = nametag.value.trim();

            if (responseText !== "" && name !== "") {
                addResponseToQuestion(questionId, name, responseText);
                responseinput.value = "";
                nametag.value = "";
                renderResponses(question.id);
            }
        });

        responseform.appendChild(responseformtitle);
        responseform.appendChild(nametag);
        responseform.appendChild(responseinput);
        responseform.appendChild(submitresponse);

        selectedquestion.appendChild(responsepart);
        selectedquestion.appendChild(responseform);

        rightcontainer.appendChild(selectedquestion);

        // Switch back to the main question list
        newBtn.addEventListener('click', function () {
            selectedquestion.style.display = 'none';
            rightpart.style.display = "block";
            rightcontainer.appendChild(rightpart);
            responseID=0;
        });
    }
});
function renderResponses(questionId) {
    const question = discussionData[questionId];
    const responseList = document.querySelector('.responseList');
    responseList.innerHTML = ''; 

    const sortedResponses = sortResponses(question.response);
    sortedResponses.forEach((response) => {
        let responseItem = document.createElement('div');
        responseItem.className = 'responses';

        let responseDataPart = document.createElement('span');
        responseDataPart.className = "responseDataPart";

        let name = document.createElement('h3');
        name.className = "personname";
        name.innerText = response.name + ':';

        let comment = document.createElement('p');
        comment.className = 'personcomment';
        comment.innerText = response.comment;

        responseDataPart.appendChild(name);
        responseDataPart.appendChild(comment);

        let responseReactPart = document.createElement('span');
        responseReactPart.className = "responseReactPart";

        let responseLikePart = document.createElement('span');
        responseLikePart.className = "responseLikePart";

        let upvotesign = document.createElement('button');
        upvotesign.className = "upvotesign";
        upvotesign.innerText = "+";

        let upvotecount = document.createElement("span");
        upvotecount.className = "upvotecount";
        upvotecount.innerText = response.upvote;

        responseLikePart.appendChild(upvotesign);
        responseLikePart.appendChild(upvotecount);

        let responseDislikePart = document.createElement('span');
        responseDislikePart.className = "responseDislikePart";

        let downvotesign = document.createElement('button');
        downvotesign.className = "downvotesign";
        downvotesign.innerText = "-";

        let downvotecount = document.createElement("span");
        downvotecount.className = "downvotecount";
        downvotecount.innerText = response.downvote;

        responseDislikePart.appendChild(downvotesign);
        responseDislikePart.appendChild(downvotecount);

        responseReactPart.appendChild(responseLikePart);
        responseReactPart.appendChild(responseDislikePart);

        responseItem.appendChild(responseDataPart);
        responseItem.appendChild(responseReactPart);
        responseList.appendChild(responseItem);

        // Add event listeners for upvote and downvote buttons
        upvotesign.addEventListener('click', function () {
            response.upvote++;
            updateInStorage(questionId, 2, response);
            upvotecount.innerText = response.upvote;

            // Re-render the responses
            renderResponses(questionId);
        });

        downvotesign.addEventListener('click', function () {
            response.downvote++;
            updateInStorage(questionId, 2, response);
            downvotecount.innerText = response.downvote;

            // Re-render the responses
            renderResponses(questionId);
        });
    });
}

// Function to add a response to a question
function addResponseToQuestion(questionId, name, comment) {
    let question = discussionData[questionId];
    responseID++;  // Increment the response ID

    let response = {
        id: responseID,
        name: name,
        comment: comment,
        upvote: 0,
        downvote: 0
    };
    question.response.push(response);

    updateInStorage(questionId, 2, response);  // 2 indicates response
}
//search button functionality
searchBtn.addEventListener('input', function () {
    // console.log("okay");
    let searchQuery = searchBtn.value.trim().toLowerCase();

    Object.values(discussionData).forEach(question => {
        if (!question.isdeleted) {
            let questionElement = document.querySelector(`[data-question-id="${question.id}"]`);
            
            let subjectText = question.subject.toLowerCase();
            let questionText = question.question.toLowerCase();

            if (subjectText.includes(searchQuery) || questionText.includes(searchQuery)) {
                // Show the element if it matches the search
                questionElement.style.display = "";

                // Highlight the search query in the subject and question
                let subjectHighlighted = highlightText(question.subject, searchQuery);
                let questionHighlighted = highlightText(question.question, searchQuery);

                let subjectElement = questionElement.querySelector('h2.subelement');
                let questionElementText = questionElement.querySelector('h4.queselement');

                subjectElement.innerHTML = subjectHighlighted;
                questionElementText.innerHTML = questionHighlighted;

            } else {
                // Hide the element if it doesn't match the search
                questionElement.style.display = "none";
            }
        }
    });

    // If the search query is empty, display all non-deleted questions
    if (searchQuery === "") {
        Object.values(discussionData).forEach(question => {
            let questionElement = document.querySelector(`[data-question-id="${question.id}"]`);
            if (!question.isdeleted) {
                questionElement.style.display = ""; // Show all non-deleted questions
            }
        });
    }
});

// Function to highlight the search text
function highlightText(text, searchQuery) {
    let regex = new RegExp(`(${searchQuery})`, 'gi'); 
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Starred questions functionality
let isShowingStarred = true; // Track whether we are showing only starred questions

favouritBtn.addEventListener('click', function () {
    Object.values(discussionData).forEach(question => {
        if (!question.isdeleted) {
            let questionElement = document.querySelector(`[data-question-id="${question.id}"]`);

            if (isShowingStarred) {
                // If currently showing all questions, show only starred ones
                questionElement.style.display = question.isstar ? "" : "none";
                favouritBtn.classList.add('star');
            } else {
                // If currently showing starred questions, show all questions
                favouritBtn.classList.remove('star');
                questionElement.style.display = "";
            }
        }
    });
    // Toggle the state for next click
    isShowingStarred = !isShowingStarred;
});

// Function to update data in localStorage
function updateInStorage(questionId, type, updatedData) {
    switch (type) {
        case 1:  // Update star status
            discussionData[questionId].isstar = updatedData;
            break;
        case 2:  // Add or update response
            let responseIndex = discussionData[questionId].response.findIndex(r => r.id === updatedData.id);
            if (responseIndex !== -1) {
                // Update existing response
                discussionData[questionId].response[responseIndex] = updatedData;
            } else {
                // Add new response
                discussionData[questionId].response.push(updatedData);
            }
            break;
        case 3:  // Remove question
            discussionData[questionId].isdeleted = true;
            break;
        default:
            break;
    }
    storedata(discussionData); // Store updated data in localStorage
}
// Function to sort responses based on votes
function sortResponses(responses) {
    return responses.sort((a, b) => {
        const aScore = a.upvote - a.downvote;
        const bScore = b.upvote - b.downvote;
        return bScore - aScore; // Sort in descending order
    });
}

setInterval(function () {
    const elements=parent.querySelectorAll(".questionItem");
    elements.forEach((element)=>{
        element.querySelector(".timeLogged").innerText = getTimeDifference(discussionData[element.getAttribute("data-question-id")].createdAt);
        // console.log(element.querySelector(".timeLogged").innerText);
    })
}, 10000); 
