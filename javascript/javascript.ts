document.addEventListener("DOMContentLoaded", () => {
    // URL de la API: en local usa el backend de tu PC; en producción cambia la segunda URL
    const API_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
        ? "http://localhost:3000"
        : "https://TU-API.onrender.com";

    const myForm = document.getElementById("commentForm") as HTMLFormElement | null;
    if (!myForm) return;

    type Campo = { input: CampoFormulario; error: HTMLElement };
    type CampoFormulario = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    type ClaveCampo = "name" | "email" | "phone" | "service" | "location" | "description";
    type TipoEstado = "ok" | "error" | "info" | "";

    // Busca un elemento por id y falla con un mensaje claro si el HTML no lo tiene
    const obtener = <T extends HTMLElement>(id: string): T => {
        const el = document.getElementById(id);
        if (!el) throw new Error(`Falta el elemento #${id} en el HTML`);
        return el as T;
    };
    const campo = (id: string): Campo => ({
        input: obtener<CampoFormulario>(id),
        error: obtener<HTMLElement>(`${id}Error`),
    });

    const campos: Record<ClaveCampo, Campo> = {
        name: campo("name"),
        email: campo("email"),
        phone: campo("phone"),
        service: campo("service"),
        location: campo("location"),
        description: campo("description"),
    };
    const submitButton = obtener<HTMLButtonElement>("btnSubmit");
    const formStatus = obtener<HTMLElement>("formStatus");

    // Forma de la respuesta de error de la API
    interface RespuestaApi {
        error?: string;
        errores?: { campo: string; mensaje: string }[];
    }

    const isEmptyRegex = /^\s*$/;
    const isValidEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidPhoneRegex = /^\d{8,10}$/;

    const reglas: Record<ClaveCampo, (v: string) => boolean> = {
        name: (v: string) => !isEmptyRegex.test(v),
        email: (v: string) => isValidEmailRegex.test(v),
        phone: (v: string) => isValidPhoneRegex.test(v),
        service: (v: string) => !isEmptyRegex.test(v),
        location: (v: string) => !isEmptyRegex.test(v),
        description: (v: string) => !isEmptyRegex.test(v),
    };

    // Nombres de clase completos (literales) para que PurgeCSS no los elimine
    const clasesEstado: Record<Exclude<TipoEstado, "">, string> = {
        ok: "form-status status-ok",
        error: "form-status status-error",
        info: "form-status status-info",
    };

    const mostrarEstado = (texto: string, tipo: TipoEstado): void => {
        formStatus.textContent = texto;
        formStatus.className = tipo ? clasesEstado[tipo] : "form-status";
    };

    myForm.addEventListener("submit", async (e: SubmitEvent) => {
        e.preventDefault();
        mostrarEstado("", "");
        let isValid = true;

        for (const [clave, { input, error }] of Object.entries(campos) as [ClaveCampo, Campo][]) {
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
            const data = (await resp.json()) as RespuestaApi;

            if (resp.ok) {
                mostrarEstado("Tu solicitud fue enviada correctamente. Te contactaremos pronto.", "ok");
                myForm.reset();
            } else {
                // La API responde { error, errores: [{ campo, mensaje }] } cuando los datos son inválidos
                const detalle = data.errores?.[0]?.mensaje ?? data.error;
                mostrarEstado(detalle || "No se pudo enviar la solicitud.", "error");
            }
        } catch (err) {
            mostrarEstado("No se pudo conectar con el servidor. Intenta de nuevo más tarde.", "error");
        } finally {
            submitButton.disabled = false;
        }
    });
});
