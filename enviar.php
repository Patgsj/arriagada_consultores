<?php
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    $nombre = strip_tags(trim($_POST["nombre"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $telefono = strip_tags(trim($_POST["telefono"]));
    $asunto = strip_tags(trim($_POST["asunto"]));
    $mensaje = strip_tags(trim($_POST["mensaje"]));

    if (empty($nombre) || empty($mensaje) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "message" => "Datos inválidos"]);
        exit;
    }

    // 1. TUS 3 DESTINATARIOS
    $destinatario = "gabriel@arriagadaconsultores.cl, info@arriagadaconsultores.cl, patricio@arriagadaconsultores.cl";
    
    $asunto_email = "Nuevo contacto Web: $asunto";

    $cuerpo_email = "Has recibido un nuevo mensaje desde el sitio web.\n\n";
    $cuerpo_email .= "Nombre: $nombre\n";
    $cuerpo_email .= "Email del cliente: $email\n"; // El correo del cliente va aquí en el texto
    $cuerpo_email .= "Teléfono: $telefono\n";
    $cuerpo_email .= "Asunto: $asunto\n\n";
    $cuerpo_email .= "Mensaje:\n$mensaje\n";

    // --- AQUÍ ESTÁ EL CAMBIO CLAVE ---
    // El correo DEBE salir de una dirección de tu propio hosting para que no rebote.
    // Usamos 'no-reply' o 'web' seguido de tu dominio.
    $headers = "From: Web Arriagada <no-reply@arriagadaconsultores.cl>\r\n"; 
    
    // Y aquí configuramos para que cuando le des "Responder", le responda al cliente.
    $headers .= "Reply-To: $email\r\n";
    
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    if (mail($destinatario, $asunto_email, $cuerpo_email, $headers)) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error del servidor"]);
    }

} else {
    echo json_encode(["status" => "error", "message" => "Acceso denegado"]);
}
?>