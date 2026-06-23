let authToken = localStorage.getItem("token") || "";
let routeLayer = null;
let alertMarkers = [];
let map = null;

/* DOM REFERENCES */
let welcomeOverlay;
let authModal;
let modalTitle;
let modalAction;
let modalEmail;
let modalPassword;
let alertsList;
let summary;
let routeInfo;

/* =========================
ONBOARDING
========================= */

function closeWelcome() {
welcomeOverlay.style.display = "none";
localStorage.setItem("seenWelcome", "yes");
}

/* =========================
AUTH STATUS
========================= */

function updateAuthStatus() {
const el = document.getElementById("authStatus");


if (!el) return;

if (authToken) {
    el.className = "badge online";
    el.textContent = "🟢 Connecté";
} else {
    el.className = "badge offline";
    el.textContent = "🔴 Non connecté";
}


}

/* =========================
MODAL
========================= */

function openLogin() {
authModal.style.display = "flex";
modalTitle.textContent = "Connexion";

modalAction.replaceWith(modalAction.cloneNode(true));
modalAction = document.getElementById("modalAction");

modalAction.addEventListener("click", login);


}

function openRegister() {
authModal.style.display = "flex";
modalTitle.textContent = "Créer un compte";


modalAction.replaceWith(modalAction.cloneNode(true));
modalAction = document.getElementById("modalAction");

modalAction.addEventListener("click", registerUser);


}

function closeModal() {
authModal.style.display = "none";
}

/* =========================
REGISTER
========================= */

async function registerUser() {
const email = modalEmail.value.trim();
const password = modalPassword.value.trim();

if (!email || !password) {
    alert("Veuillez remplir tous les champs");
    return;
}

try {
    const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: "User",
            email,
            password
        })
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.message || "Erreur inscription");
        return;
    }

    alert("Compte créé avec succès");
    closeModal();

} catch (err) {
    console.error(err);
    alert("Erreur serveur");
}


}

/* =========================
LOGIN
========================= */

async function login() {
try {


    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: modalEmail.value.trim(),
            password: modalPassword.value.trim()
        })
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
        alert("Échec de la connexion");
        return;
    }

    authToken = data.token;
    localStorage.setItem("token", authToken);

    updateAuthStatus();
    closeModal();

    await loadAlerts();
    await loadSummary();

} catch (error) {
    console.error(error);
    alert("Erreur serveur");
}


}

/* =========================
LOGOUT
========================= */

function logout() {
authToken = "";
localStorage.removeItem("token");

alertMarkers.forEach(marker => {
    if (map) map.removeLayer(marker);
});

alertMarkers = [];

if (alertsList) {
    alertsList.innerHTML = "Veuillez vous connecter";
}

if (summary) {
    summary.innerHTML = "Veuillez vous connecter";
}

updateAuthStatus();


}

/* =========================
CREATE ALERT
========================= */

async function createAlert() {


if (!authToken) {
    alert("Veuillez vous connecter");
    return;
}

const road = document.getElementById("road");
const description = document.getElementById("description");
const severity = document.getElementById("severity");

if (!road.value.trim() || !description.value.trim()) {
    alert("Veuillez remplir tous les champs");
    return;
}

try {

    const response = await fetch("/api/alerts", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            road: road.value.trim(),
            description: description.value.trim(),
            severity: severity.value,
            type: "Congestion"
        })
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.message || "Erreur lors de la création de l'alerte");
        return;
    }

    alert("Alerte envoyée avec succès");

    road.value = "";
    description.value = "";

    await loadAlerts();
    await loadSummary();

} catch (error) {
    console.error(error);
    alert("Erreur serveur");
}


}

/* =========================
ROUTE SEARCH
========================= */

async function getRoute() {

try {

    const start = document.getElementById("startPlace");
    const end = document.getElementById("endPlace");

    if (!start.value.trim() || !end.value.trim()) {
        alert("Veuillez remplir les deux champs");
        return;
    }

    const response = await fetch("/api/routes/recommend-smart", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            startPlace: start.value.trim(),
            endPlace: end.value.trim()
        })
    });

    const data = await response.json();

    if (!response.ok || !data.recommendation) {
        alert(data.error || "Erreur itinéraire");
        return;
    }

    routeInfo.innerHTML = `
        🚗 <b>Distance :</b> ${data.recommendation.distance}<br>
        ⏱️ <b>Temps :</b> ${data.recommendation.estimatedTime}
    `;

    if (routeLayer) {
        map.removeLayer(routeLayer);
    }

    if (!data.recommendation.geometry?.coordinates) {
        alert("Pas de géométrie disponible");
        return;
    }

    const coords =
        data.recommendation.geometry.coordinates.map(
            c => [c[1], c[0]]
        );

    routeLayer =
        L.polyline(coords, { weight: 4 }).addTo(map);

    map.fitBounds(routeLayer.getBounds());

} catch (error) {
    console.error(error);
    alert("Erreur itinéraire");
}


}

/* =========================
TIME FORMAT
========================= */

function timeAgo(date) {


const diff =
    Math.floor((new Date() - new Date(date)) / 1000);

if (diff < 60) return `il y a ${diff} sec`;

const min = Math.floor(diff / 60);
if (min < 60) return `il y a ${min} min`;

const hours = Math.floor(diff / 3600);
if (hours < 24) return `il y a ${hours} h`;

return `il y a ${Math.floor(hours / 24)} jour(s)`;


}

/* =========================
ALERTS
========================= */

async function loadAlerts() {


if (!alertsList) return;

alertMarkers.forEach(marker => {
    if (map) map.removeLayer(marker);
});

alertMarkers = [];

if (!authToken) {
    alertsList.innerHTML = "Veuillez vous connecter";
    return;
}

try {

    const response = await fetch("/api/alerts", {
        headers: {
            Authorization: `Bearer ${authToken}`
        }
    });

    const data = await response.json();

    if (!data.alerts) return;

    const now = new Date();

    const filteredAlerts = data.alerts.filter(alert => {
        const createdAt = new Date(alert.createdAt);
        return ((now - createdAt) / (1000 * 60 * 60)) <= 12;
    });

    alertsList.innerHTML =
        filteredAlerts.length
            ? filteredAlerts
                .slice(0, 10)
                .map(alert => `
                    <div>
                        <b>${alert.road}</b><br>
                        ${alert.description}<br>
                        ${timeAgo(alert.createdAt)}
                    </div>
                    <hr>
                `)
                .join("")
            : "Aucune alerte récente";

} catch (error) {
    console.error(error);
}


}

/* =========================
SUMMARY
========================= */

async function loadSummary() {


if (!summary) return;

if (!authToken) {
    summary.innerHTML = "Veuillez vous connecter";
    return;
}

try {

    const response =
        await fetch("/api/alerts/traffic-summary", {
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        });

    const data = await response.json();

    if (!data.summary) return;

    summary.innerHTML = `
        🚦 Total : ${data.summary.totalAlerts}<br>
        🔴 High : ${data.summary.high}<br>
        🟠 Medium : ${data.summary.medium}<br>
        🟢 Low : ${data.summary.low}
    `;

} catch (error) {
    console.error(error);
}


}

/* =========================
FEEDBACK
========================= */

async function sendFeedback() {


const routeElement =
    document.getElementById("routeFeedback");

const alertElement =
    document.getElementById("alertFeedback");

const improvementElement =
    document.getElementById("improvementFeedback");

if (
    !routeElement ||
    !alertElement ||
    !improvementElement
) {
    alert("Erreur formulaire");
    return;
}

const improvementFeedback =
    improvementElement.value.trim();

if (improvementFeedback.length < 5) {
    alert("Veuillez saisir au moins 5 caractères.");
    return;
}

if (!authToken) {
    alert("Veuillez vous connecter.");
    return;
}

try {

    const response = await fetch(
        "/api/feedback",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`
            },
            body: JSON.stringify({
                routeFeedback: routeElement.value,
                alertFeedback: alertElement.value,
                improvementFeedback
            })
        }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.error || "Erreur envoi"
        );
    }

    alert("Merci pour votre avis !");

    improvementElement.value = "";
    routeElement.selectedIndex = 0;
    alertElement.selectedIndex = 0;

} catch (error) {
    console.error(error);
    alert(error.message);
}


}

/* =========================
INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {


welcomeOverlay =
    document.getElementById("welcomeOverlay");

authModal =
    document.getElementById("authModal");

modalTitle =
    document.getElementById("modalTitle");

modalAction =
    document.getElementById("modalAction");

modalEmail =
    document.getElementById("modalEmail");

modalPassword =
    document.getElementById("modalPassword");

alertsList =
    document.getElementById("alertsList");

summary =
    document.getElementById("summary");

routeInfo =
    document.getElementById("routeInfo");

map =
    L.map("map").setView(
        [-4.325, 15.322],
        12
    );

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
).addTo(map);

if (localStorage.getItem("seenWelcome")) {
    welcomeOverlay.style.display = "none";
}

document
    .getElementById("closeWelcomeBtn")
    .addEventListener("click", closeWelcome);

document
    .getElementById("loginBtn")
    .addEventListener("click", openLogin);

document
    .getElementById("registerBtn")
    .addEventListener("click", openRegister);

document
    .getElementById("logoutBtn")
    .addEventListener("click", logout);

document
    .getElementById("getRouteBtn")
    .addEventListener("click", getRoute);

document
    .getElementById("createAlertBtn")
    .addEventListener("click", createAlert);

document
    .getElementById("sendFeedbackBtn")
    .addEventListener("click", sendFeedback);

document
    .getElementById("closeModalBtn")
    .addEventListener("click", closeModal);

updateAuthStatus();

loadSummary();
loadAlerts();

setInterval(() => {
    loadSummary();
    loadAlerts();
}, 30000);


});