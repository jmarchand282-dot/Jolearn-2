const WHATSAPP_NUMBER="";
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);

const LEVELS=[
 {id:"A1",name:"Débutant",icon:"🌱",free:true,lessons:25},
 {id:"A2",name:"Élémentaire",icon:"🌿",free:true,lessons:25},
 {id:"B1",name:"Intermédiaire",icon:"🚀",free:true,lessons:25},
 {id:"B2",name:"Intermédiaire supérieur",icon:"⭐",free:false,lessons:25},
 {id:"C1",name:"Avancé",icon:"🏆",free:false,lessons:25},
 {id:"C2",name:"Maîtrise",icon:"👑",free:false,lessons:25}
];

const LESSONS={
 A1:[
  ["Salutations","Hello, hi, goodbye","👋"],
  ["Se présenter","My name is…, I am…","🙋"],
  ["Famille","mother, father, sister, brother","👨‍👩‍👧"],
  ["Nombres","one, two, three…","🔢"],
  ["Couleurs","red, blue, green, black","🎨"]
 ],
 A2:[
  ["Routine quotidienne","wake up, work, study","⏰"],
  ["Maison","room, kitchen, bedroom","🏠"],
  ["Nourriture","food, drink, breakfast","🍎"],
  ["Ville","street, shop, station","🏙️"],
  ["Voyage","ticket, hotel, airport","✈️"]
 ],
 B1:[
  ["Opinions","I think…, In my opinion…","💬"],
  ["Travail","job, meeting, project","💼"],
  ["Projets","plans, goals, future","🎯"],
  ["Expériences","have been, have done","🧭"],
  ["Communication","agree, explain, suggest","🗣️"]
 ]
};

let state=JSON.parse(localStorage.getItem("jolearn_state")||"null")||{
 onboard:false,name:"Joseph",language:"Anglais",level:"A1",goal:"Voyage",
 xp:0,coins:0,lives:5,streak:0,lessons:0,daily:0,dark:false,sound:true,
 completed:[],lastDay:null
};

let onboardStep=0;
const onboardData=[
 {title:"Bienvenue sur JoLearn 👋",text:"Apprends une langue avec des leçons courtes, des quiz et un parcours adapté.",type:"welcome"},
 {title:"Quelle langue veux-tu apprendre ?",text:"Tu pourras en ajouter d'autres plus tard.",type:"language",items:[["🇬🇧","Anglais"],["🇫🇷","Français"],["🇪🇸","Espagnol"],["🇩🇪","Allemand"]]},
 {title:"Quel est ton niveau ?",text:"Choisis ton niveau estimé. Tu pourras ensuite modifier ton parcours.",type:"level",items:[["🌱","Débutant total"],["🌿","Quelques connaissances"],["🚀","Intermédiaire"]]},
 {title:"Pourquoi apprends-tu ?",text:"Cela nous aide à personnaliser ton expérience.",type:"goal",items:[["✈️","Voyage"],["💼","Travail"],["🎓","Études"],["🗣️","Communication"]]},
 {title:"Mini test de placement 🧠",text:"Réponds à 5 questions pour obtenir une suggestion.",type:"test"}
];

const placement=[
 ["What is 'hello' in French?",["Bonjour","Merci","Au revoir"],0],
 ["Choose: 'I ___ a student.'",["am","is","are"],0],
 ["What is 'book'?",["Livre","Maison","Table"],0],
 ["Choose: 'She ___ English.'",["speak","speaks","speaking"],1],
 ["What is 'thank you'?",["Pardon","Merci","Salut"],1]
];
let testIndex=0,testScore=0;

function save(){localStorage.setItem("jolearn_state",JSON.stringify(state))}
function start(){
 setTimeout(()=>{$("#splash").classList.add("hidden");if(state.onboard){showMain();}else{showOnboard()}},900);
}
function showOnboard(){ $("#onboarding").classList.remove("hidden");renderOnboard(); }
function renderOnboard(){
 const d=onboardData[onboardStep];
 $("#onboardProgress").style.width=((onboardStep+1)/onboardData.length*100)+"%";
 let html=`<h2>${d.title}</h2><p>${d.text}</p>`;
 if(d.type==="welcome"){html+=`<div class="choices"><div class="choice selected"><span class="emoji">🎯</span><div><b>Apprends à ton rythme</b><small>Progression, XP et exercices interactifs.</small></div></div></div>`}
 if(d.items){html+=`<div class="choices">`+d.items.map((x,i)=>`<button class="choice ${selectedFor(d.type,x[1])?'selected':''}" data-choice="${i}"><span class="emoji">${x[0]}</span><b>${x[1]}</b></button>`).join("")+`</div>`}
 if(d.type==="test") html+=testHTML();
 $("#onboardContent").innerHTML=html;
 if(d.type==="test") attachTest();
 $$("#onboardContent .choice").forEach((b,i)=>b.onclick=()=>selectChoice(d.type,i));
}
function selectedFor(type,value){
 if(type==="language")return state.language===value;
 if(type==="level")return (state._levelChoice||"Débutant total")===value;
 if(type==="goal")return state.goal===value;
 return false;
}
function selectChoice(type,i){
 const d=onboardData[onboardStep];
 if(type==="language")state.language=d.items[i][1];
 if(type==="level")state._levelChoice=d.items[i][1];
 if(type==="goal")state.goal=d.items[i][1];
 renderOnboard();
}
function testHTML(){
 const q=placement[testIndex];
 return `<div class="quiz-card"><p class="eyebrow">QUESTION ${testIndex+1}/5</p><h3>${q[0]}</h3><div id="testOptions">${q[1].map((o,i)=>`<button class="quiz-option" data-test="${i}">${o}</button>`).join("")}</div><p id="testFeedback" class="feedback"></p></div>`;
}
function attachTest(){
 $$("#testOptions .quiz-option").forEach(b=>b.onclick=()=>{
  if(b.disabled)return;
  const i=+b.dataset.test,q=placement[testIndex];
  $$("#testOptions button").forEach(x=>x.disabled=true);
  if(i===q[2]){testScore++;b.classList.add("correct");$("#testFeedback").textContent="✓ Correct !"}
  else{b.classList.add("wrong");$("#testFeedback").textContent="La bonne réponse : "+q[1][q[2]]}
  setTimeout(()=>{
   testIndex++;
   if(testIndex<placement.length){renderOnboard();}
   else{
    const suggested=testScore>=4?"A2":testScore>=2?"A1":"A1";
    state.level=suggested;
    state.onboard=true;delete state._levelChoice;save();showMain();
   }
  },700);
 });
}
$("#onboardNext").onclick=()=>{
 if(onboardStep===0){onboardStep++;renderOnboard();return}
 if(onboardData[onboardStep].type==="test")return;
 onboardStep++;
 if(onboardStep<onboardData.length)renderOnboard();
};

function showMain(){
 $("#onboarding").classList.add("hidden");$("#main").classList.remove("hidden");
 updateUI();showPage("home");
}
function updateUI(){
 $("#hello").textContent=`Bonjour ${state.name} 👋`;
 $("#goalText").textContent=`Objectif : ${state.goal}`;
 $("#homeLevel").textContent=`${state.level} · ${LEVELS.find(x=>x.id===state.level)?.name||"Débutant"}`;
 $("#homeXP").textContent=state.xp;
 $("#streak").textContent=state.streak;
 $("#coins").textContent=state.coins;
 $("#lives").textContent=state.lives;
 $("#homeProgress").textContent=`${state.lessons} leçon${state.lessons>1?"s":""} terminée${state.lessons>1?"s":""}`;
 $("#dailyXP").textContent=`${Math.min(state.daily,50)} / 50 XP`;
 $("#dailyBar").style.width=Math.min(state.daily/50*100,100)+"%";
 $("#profileName").textContent=state.name;
 $("#profileLevel").textContent=`${state.level} · ${LEVELS.find(x=>x.id===state.level)?.name||""}`;
 $("#pXP").textContent=state.xp;$("#pCoins").textContent=state.coins;$("#pLessons").textContent=state.lessons;
 renderCourses();renderLevels();
}
function renderCourses(){
 const list=LESSONS[state.level]||LESSONS.A1;
 $("#courseList").innerHTML=list.map((l,i)=>{
  const key=state.level+"-"+i,done=state.completed.includes(key);
  return `<div class="course"><div class="icon">${done?"✓":l[2]}</div><div><h3>${l[0]}</h3><p>${l[1]}</p></div><button data-lesson="${i}">${done?"Revoir":"Commencer"}</button></div>`;
 }).join("");
 $$("#courseList button").forEach(b=>b.onclick=()=>completeLesson(+b.dataset.lesson));
}
function completeLesson(i){
 const key=state.level+"-"+i;
 if(!state.completed.includes(key)){state.completed.push(key);state.lessons++;state.xp+=10;state.coins+=3;state.daily+=10;save();updateUI();alert("🎉 Leçon terminée ! +10 XP et +3 pièces");}
}
function renderLevels(){
 $("#allLevels").innerHTML=LEVELS.map(l=>`<div class="level ${l.free?"":"premium"}"><div class="num">${l.icon}</div><div><h3>${l.id} · ${l.name}</h3><p>${l.lessons} leçons prévues · ${l.free?"Gratuit":"Premium 🔒"}</p></div><button data-level="${l.id}">${l.free?"Ouvrir":"🔒"}</button></div>`).join("");
 $$("#allLevels button").forEach(b=>b.onclick=()=>{
  const l=LEVELS.find(x=>x.id===b.dataset.level);
  if(!l.free){openWhatsApp();return}
  state.level=l.id;save();updateUI();showPage("home");
 });
}
function showPage(name){
 $$(".page").forEach(p=>p.classList.add("hidden"));
 $("#page-"+name).classList.remove("hidden");
 $$(".nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===name));
 if(name==="quiz")newQuiz();
 if(name==="bot")initChat();
}
$$(".nav button").forEach(b=>b.onclick=()=>showPage(b.dataset.page));
$$("[data-page='profile']").forEach(b=>b.onclick=()=>showPage("profile"));
$("#chooseLevel").onclick=()=>showPage("learn");

let currentQuiz=null;
const quizData=[
 ["What does 'Good morning' mean?",["Bonsoir","Bonjour","Merci"],1],
 ["Choose: I ___ English every day.",["study","studies","studying"],0],
 ["What does 'book' mean?",["Livre","Chaise","École"],0],
 ["Choose: She ___ happy.",["are","am","is"],2]
];
function newQuiz(){
 currentQuiz=quizData[Math.floor(Math.random()*quizData.length)];
 $("#quizQuestion").textContent=currentQuiz[0];$("#quizFeedback").textContent="";$("#nextQuiz").classList.add("hidden");
 $("#quizOptions").innerHTML=currentQuiz[1].map((o,i)=>`<button class="quiz-option" data-q="${i}">${o}</button>`).join("");
 $$("#quizOptions button").forEach(b=>b.onclick=()=>answerQuiz(+b.dataset.q));
}
function answerQuiz(i){
 $$("#quizOptions button").forEach(b=>b.disabled=true);
 if(i===currentQuiz[2]){state.xp+=5;state.coins+=1;state.daily+=5;$("#quizFeedback").textContent="🎉 Correct ! +5 XP";$("#quizOptions button")[i].classList.add("correct");}
 else{$("#quizFeedback").textContent="❌ Bonne réponse : "+currentQuiz[1][currentQuiz[2]];$("#quizOptions button")[i].classList.add("wrong");state.lives=Math.max(0,state.lives-1)}
 save();updateUI();$("#nextQuiz").classList.remove("hidden");
}
$("#nextQuiz").onclick=newQuiz;

function initChat(){
 if(!$("#chat").children.length){
  addMsg("bot","Bonjour ! Je suis JoBot 🤖. Écris une phrase en anglais et je peux te donner une correction simple.");
 }
}
function addMsg(who,text){const d=document.createElement("div");d.className="msg "+who;d.textContent=text;$("#chat").appendChild(d);$("#chat").scrollTop=$("#chat").scrollHeight}
function botReply(t){
 const x=t.toLowerCase().trim();
 if(x.includes("i go")||x.includes("i goes"))return "Si tu parles d'une habitude : « I go… ». Pour hier : « I went… ». Exemple : Yesterday, I went to school.";
 if(x.includes("hello")||x.includes("hi"))return "Hello ! 👋 Une bonne réponse serait : « Hello! How are you? »";
 if(x.includes("thank"))return "You're welcome! = De rien !";
 return "Bonne phrase 👍. Pour une correction précise, connecte JoBot à une véritable API IA. Dans cette version, je peux déjà répondre à quelques cas courants.";
}
$("#sendChat").onclick=sendChat;
$("#chatInput").onkeydown=e=>{if(e.key==="Enter")sendChat()};
function sendChat(){const t=$("#chatInput").value.trim();if(!t)return;addMsg("user",t);$("#chatInput").value="";setTimeout(()=>addMsg("bot",botReply(t)),300)}

$("#darkMode").onclick=()=>{state.dark=!state.dark;document.body.classList.toggle("dark",state.dark);save()};
$("#soundToggle").onclick=()=>{state.sound=!state.sound;$("#soundToggle span").textContent=state.sound?"Activés":"Désactivés";save()};
$("#resetProgress").onclick=()=>{if(confirm("Réinitialiser toute la progression ?")){localStorage.removeItem("jolearn_state");location.reload()}};
function openWhatsApp(){
 const number=window.WHATSAPP_NUMBER||"";
 if(!number){alert("Ajoute ton numéro dans app.js dans la variable WHATSAPP_NUMBER avant d'utiliser ce bouton.");return}
 location.href=`https://wa.me/${number}?text=${encodeURIComponent("Bonjour, je souhaite obtenir l'accès Premium de JoLearn.")}`;
}
$("#whatsapp").onclick=openWhatsApp;

document.body.classList.toggle("dark",state.dark);
start();

if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));}
