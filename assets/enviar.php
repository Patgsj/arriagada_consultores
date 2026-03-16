<?php
// Configuración para que el navegador sepa que respondemos JSON
header('Content-Type: application/json');

// Verificamos que sea una petición POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // 1. Recibir y limpiar datos
    $nombre = strip_tags(trim($_POST["nombre"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $telefono = strip_tags(trim($_POST["telefono"]));
    $asunto = strip_tags(trim($_POST["asunto"]));
    $mensaje = strip_tags(trim($_POST["mensaje"]));

    // 2. Validación básica
    if (empty($nombre) || empty($mensaje) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "message" => "Datos inválidos"]);
        exit;
    }

    // 3. Configurar el correo
    $destinatario = "info@arriagadaconsultores.cl";
    $asunto_email = "Nuevo contacto Web: $asunto";

    $cuerpo_email = "Has recibido un nuevo mensaje desde el sitio web.\n\n";
    $cuerpo_email .= "Nombre: $nombre\n";
    $cuerpo_email .= "Email: $email\n";
    $cuerpo_email .= "Teléfono: $telefono\n";
    $cuerpo_email .= "Asunto: $asunto\n\n";
    $cuerpo_email .= "Mensaje:\n$mensaje\n";

    // Cabeceras
    $headers = "From: $nombre <$email>";

    // 4. Enviar el correo
    if (mail($destinatario, $asunto_email, $cuerpo_email, $headers)) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error del servidor"]);
    }

} else {
    // Si intentan entrar directo a enviar.php
    echo json_encode(["status" => "error", "message" => "Acceso denegado"]);
}
?>