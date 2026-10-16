document.addEventListener("DOMContentLoaded", () => {
    // URL de la API: en local usa el backend de tu PC; en producción cambia la segunda URL
    const API_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
        ? "http://localhost:3000"
        : "https://TU-API.onrender.com";

    const myForm = document.getElementById("commentForm");
    if (!myForm) return;

    const campos = {
        name: { input: document.getElementById("name"), error: document.getElementById("nameError") },
        email: { input: document.getElementById("email"), error: document.getElementById("emailError") },
        phone: { input: document.getElementById("phone"), error: document.getElementById("phoneError") },
        service: { input: document.getElementById("service"), error: document.getElementById("serviceError") },
        location: { input: document.getElementById("location"), error: document.getElementById("locationError") },
        description: { input: document.getElementById("description"), error: document.getElementById("descriptionError") },
    };
    const submitButton = document.getElementById("btnSubmit");
    const formStatus = document.getElementById("formStatus");

    const isEmptyRegex = /^\s*$/;
    const isValidEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidPhoneRegex = /^\d{8,10}$/;

    const reglas = {
        name: (v) => !isEmptyRegex.test(v),
        email: (v) => isValidEmailRegex.test(v),
        phone: (v) => isValidPhoneRegex.test(v),
        service: (v) => !isEmptyRegex.test(v),
        location: (v) => !isEmptyRegex.test(v),
        description: (v) => !isEmptyRegex.test(v),
    };

    // Nombres de clase completos (literales) para que PurgeCSS no los elimine
    const clasesEstado = {
        ok: "form-status status-ok",
        error: "form-status status-error",
        info: "form-status status-info",
    };

    const mostrarEstado = (texto, tipo) => {
        formStatus.textContent = texto;
        formStatus.className = clasesEstado[tipo] || "form-status";
    };

    myForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        mostrarEstado("", "");
        let isValid = true;

        for (const [clave, { input, error }] of Object.entries(campos)) {
            error.style.display = "none";
            if (!reglas[clave](input.value)) {
                error.style.display = "block";
                isValid = false;
            }
        }
        if (!isValid) return;

        const datos = {
            nombre: campos.name.input.value.trim(),
            correo: campos.email.input.value.trim(),
            telefono: campos.phone.input.value.trim(),
            tipoServicio: campos.service.input.value,
            ubicacion: campos.location.input.value.trim(),
            descripcion: campos.description.input.value.trim(),
        };

        submitButton.disabled = true;
        mostrarEstado("Enviando...", "info");

        try {
            const resp = await fetch(`${API_URL}/api/cotizaciones`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos),
            });
            const data = await resp.json();

            if (resp.ok) {
                mostrarEstado("Tu solicitud fue enviada correctamente. Te contactaremos pronto.", "ok");
                myForm.reset();
            } else {
                // La API responde { error, errores: [{ campo, mensaje }] } cuando los datos son inválidos
                const detalle = data.errores && data.errores[0] ? data.errores[0].mensaje : data.error;
                mostrarEstado(detalle || "No se pudo enviar la solicitud.", "error");
            }
        } catch (err) {
            mostrarEstado("No se pudo conectar con el servidor. Intenta de nuevo más tarde.", "error");
        } finally {
            submitButton.disabled = false;
        }
    });
});
