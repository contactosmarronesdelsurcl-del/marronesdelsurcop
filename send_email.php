<?php
// Configuración del correo destino
$to = 'contactosmarronesdelsur.cl@gmail.com';
$subject = 'Contacto desde sitio web Marrones del Sur';

// Recibir datos del formulario
$nombre = isset($_POST['nombre']) ? sanitize_input($_POST['nombre']) : '';
$empresa = isset($_POST['empresa']) ? sanitize_input($_POST['empresa']) : '';
$email = isset($_POST['email']) ? filter_var($_POST['email'], FILTER_SANITIZE_EMAIL) : '';
$telefono = isset($_POST['telefono']) ? sanitize_input($_POST['telefono']) : '';
$mensaje = isset($_POST['mensaje']) ? sanitize_input($_POST['mensaje']) : '';
$captcha = isset($_POST['captcha']) ? sanitize_input($_POST['captcha']) : '';

// Validación básica
if (empty($nombre) || empty($email) || empty($mensaje)) {
    http_response_code(400);
    echo json_encode(['error' => 'Por favor completa los campos requeridos.']);
    exit;
}

// Validación de email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'El correo no es válido.']);
    exit;
}

// Armar el cuerpo del mensaje
$body = "Nombre: $nombre\n";
if (!empty($empresa)) {
    $body .= "Empresa: $empresa\n";
}
$body .= "Email: $email\n";
if (!empty($telefono)) {
    $body .= "Teléfono: $telefono\n";
}
$body .= "\nMensaje:\n$mensaje\n";
$body .= "\n--- Enviado desde el sitio web ---";

// Headers del correo
$headers = "From: $email\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Enviar correo
$mail_sent = mail($to, $subject, $body, $headers);

if ($mail_sent) {
    http_response_code(200);
    echo json_encode(['success' => 'Mensaje enviado correctamente. Nos pondremos en contacto pronto.']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Hubo un problema al enviar el mensaje. Intenta de nuevo.']);
}

// Función para sanitizar entrada
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}
?>
