let authToken = localStorage.getItem("token") || "";
let routeLayer;
let alertMarkers = [];

/* MAP */
const map = L.map("map").setView([-4.325, 15.322], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

/* ONBOARDING */
function closeWelcome() {
    welcomeOverlay.style.display = "none";
    localStorage.setItem("seenWelcome", "yes");
}

window.addEventListener("load", () => {
    if (localStorage.getItem("seenWelcome")) {
        welcomeOverlay.style.display = "none";
    }
});

/* AUTH STATUS */
function updateAuthStatus() {
    const el = document.getElementById("authStatus");

    if (authToken) {
        el.className = "badge online";
        el.textContent = "🟢 Connecté";
    } else {
        el.className = "badge offline";
        el.textContent = "🔴 Non connecté";
    }
}

/* MODAL */
function openLogin() {
    authModal.style.display = "flex";
    modalTitle.innerText = "Connexion";
    modalAction.onclick = login;
}

function openRegister() {
    authModal.style.display = "flex";
    modalTitle.innerText = "Créer un compte";
    modalAction.onclick = registerUser;
}

function closeModal() {
    authModal.style.display = "none";
}

/* REGISTER */
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
            headers: { "Content-Type": "application/json" },
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

/* LOGIN */
async function login() {
    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: modalEmail.value,
            password: modalPassword.value
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

    loadAlerts();
    loadSummary();
}

/* LOGOUT */
function logout() {
    authToken = "";
    localStorage.removeItem("token");

    alertMarkers.forEach(m => map.removeLayer(m));
    alertMarkers = [];

    if (typeof alertsList !== "undefined") {
        alertsList.innerHTML = "Veuillez vous connecter";
    }

    if (typeof summary !== "undefined") {
        summary.innerHTML = "Veuillez vous connecter";
    }

    updateAuthStatus();
}


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

        loadAlerts();
        loadSummary();

    } catch (error) {
        console.error(error);
        alert("Erreur serveur");
    }
}


/* ROUTE */
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
            headers: { "Content-Type": "application/json" },
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
            🚗 <b>Distance :</b> ${data.recommendation.distance}
            <br>
            ⏱️ <b>Temps :</b> ${data.recommendation.estimatedTime}
        `;

        if (routeLayer) map.removeLayer(routeLayer);

        if (!data.recommendation.geometry?.coordinates) {
            alert("Pas de géométrie disponible");
            return;
        }

        const coords = data.recommendation.geometry.coordinates.map(c => [c[1], c[0]]);

        routeLayer = L.polyline(coords, { weight: 4 }).addTo(map);
        map.fitBounds(routeLayer.getBounds());

    } catch (e) {
        console.error(e);
        alert("Erreur itinéraire");
    }
}

/* ALERT TIME FORMAT */
function timeAgo(d) {
    const diff = Math.floor((new Date() - new Date(d)) / 1000);

    if (diff < 60) return `il y a ${diff} sec`;

    const min = Math.floor(diff / 60);
    if (min < 60) return `il y a ${min} min`;

    const h = Math.floor(diff / 3600);
    if (h < 24) return `il y a ${h} h`;

    const days = Math.floor(h / 24);
    return `il y a ${days} jour(s)`;
}

/* ALERTS */
async function loadAlerts() {
    alertMarkers.forEach(m => map.removeLayer(m));
    alertMarkers = [];

    if (!authToken) {
        alertsList.innerHTML = "Veuillez vous connecter";
        return;
    }

    const response = await fetch("/api/alerts", {
        headers: { Authorization: `Bearer ${authToken}` }
    });

    const data = await response.json();

    if (!data.alerts) return;

    // 🔥 FILTER: only alerts less than 3 hours old
    const now = new Date();

    const filteredAlerts = data.alerts.filter(a => {
        const createdAt = new Date(a.createdAt);
        const diffHours = (now - createdAt) / (1000 * 60 * 60);
        return diffHours <= 3;
    });

    // 🖥️ DISPLAY ONLY FILTERED ALERTS
    alertsList.innerHTML = filteredAlerts.length
        ? filteredAlerts
            .slice(0, 10)
            .map(a => `
                <div>
                    <b>${a.road}</b><br>
                    ${a.description}<br>
                    ${timeAgo(a.createdAt)}
                </div>
                <hr>
            `).join("")
        : "Aucune alerte récente (en moins de 3 heures)";

    // 🗺️ MAP MARKERS ONLY FOR FILTERED ALERTS
    filteredAlerts.forEach(a => {
        const marker = L.marker(map.getCenter())
            .addTo(map)
            .bindPopup(`<b>${a.road}</b><br>${a.description}`);

        alertMarkers.push(marker);
    });
}
/* SUMMARY */
async function loadSummary() {
    if (!authToken) {
        summary.innerHTML = "Veuillez vous connecter";
        return;
    }

    const response = await fetch("/api/alerts/traffic-summary", {
        headers: { Authorization: `Bearer ${authToken}` }
    });

    const data = await response.json();

    if (!data.summary) return;

    summary.innerHTML = `
        🚦 Total : ${data.summary.totalAlerts}<br>
        🔴 High : ${data.summary.high}<br>
        🟠 Medium : ${data.summary.medium}<br>
        🟢 Low : ${data.summary.low}
    `;
}

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
    updateAuthStatus();
    loadSummary();
    loadAlerts();

    setInterval(() => {
        loadSummary();
        loadAlerts();
    }, 30000);
});

async function sendFeedback(){

    try{

        /* Find Elements */

        const routeElement =
        document.getElementById(
            "routeFeedback"
        );

        const alertElement =
        document.getElementById(
            "alertFeedback"
        );

        const improvementElement =
        document.getElementById(
            "improvementFeedback"
        );

        /* Verify Elements Exist */

        if(
            !routeElement ||
            !alertElement ||
            !improvementElement
        ){

            console.error(
                "Feedback form elements not found"
            );

            alert(
                "Erreur de configuration du formulaire de feedback."
            );

            return;

        }

        const routeFeedback = routeElement.value;

        const alertFeedback = alertElement.value;

        const improvementFeedback = improvementElement.value.trim();

        /* Validation */

        if(improvementFeedback.length < 5){

            alert(
                "Veuillez saisir au moins 5 caractères."
            );

            return;

        }

        if(improvementFeedback.length > 500){

            alert(
                "Votre commentaire est trop long (maximum 500 caractères)."
            );

            return;

        }

        if(!authToken){

            alert(
                "Veuillez vous connecter avant d'envoyer un avis."
            );

            return;

        }

        const response = await fetch(

            "/api/feedback",

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json",

                    Authorization:
                    `Bearer ${authToken}`

                },

                body:JSON.stringify({

                    routeFeedback,

                    alertFeedback,

                    improvementFeedback

                })

            }

        );

        const data = await response.json();

        if(!response.ok || !data.success){

            throw new Error(

                data.error ||

                "Erreur lors de l'envoi"

            );

        }

        alert(
            "Merci pour votre avis !"
        );

        /* Reset Form */

        improvementElement.value = "";

        routeElement.selectedIndex = 0;

        alertElement.selectedIndex = 0;

    }
    catch(error){

        console.error(
            "FEEDBACK ERROR:",
            error
        );

        alert(
            error.message || "Erreur lors de l'envoi du feedback"
        );

    }

}


