// Texto de Términos y Condiciones como HTML. Se inyecta con [innerHTML] en los
// modales legales (AuthComponent y CatalogoComponent). Solo contenido, sin lógica.
export const TERMINOS_Y_CONDICIONES = `
<h2>Términos y Condiciones de Uso: Vitis & Byte</h2>

<h3>1. Introducción</h3>
<p>Bienvenido a <strong>Vitis & Byte</strong>. El presente documento constituye un contrato legalmente vinculante entre el usuario (en adelante, el "Usuario") y los propietarios y desarrolladores de la plataforma (en adelante, el "Prestador"). Al acceder, navegar o realizar transacciones en este sitio web, el Usuario manifiesta su consentimiento expreso y sin reservas a los presentes términos.</p>
<p>Este contrato se fundamenta en la <strong>Ley Federal de Protección al Consumidor (LFPC)</strong>, la <strong>Ley General de Salud</strong>, la <strong>NOM-142-SSA1/SCFI-2014</strong> y demás disposiciones aplicables al comercio electrónico en los Estados Unidos Mexicanos. El desconocimiento del contenido de este documento no exime al Usuario de las responsabilidades derivadas de su incumplimiento.</p>

<h3>2. Uso del Servicio</h3>
<p>El uso de <strong>Vitis & Byte</strong> está estrictamente condicionado al cumplimiento de las siguientes normas de conducta y legalidad:</p>
<ul>
  <li><strong>Mayoría de Edad Obligatoria:</strong> En estricto cumplimiento con la <strong>Ley General de Salud</strong> y el <strong>Artículo 76 Bis de la LFPC</strong>, el servicio está reservado exclusivamente para personas físicas con plena capacidad jurídica y que tengan al menos 18 años de edad. El Prestador implementa mecanismos tecnológicos de validación de edad; cualquier intento de eludir estos controles mediante información falsa constituye una violación grave a este contrato.</li>
  <li><strong>Restricciones de Uso:</strong> El Usuario se obliga a utilizar la plataforma únicamente para fines lícitos de adquisición de productos vitivinícolas. Queda prohibido el uso del sitio para la reventa no autorizada, el envío de spam, o cualquier actividad que interfiera con el correcto funcionamiento de los servidores.</li>
  <li><strong>Verificación al Momento de la Entrega:</strong> De acuerdo con la <strong>NOM-142-SSA1/SCFI-2014</strong>, el Usuario o la persona que reciba el producto en el domicilio indicado deberá presentar una identificación oficial vigente (INE o Pasaporte) para validar la mayoría de edad. En caso de no acreditarse, el Prestador se reserva el derecho de no entregar el producto.</li>
</ul>

<h3>3. Registro y Cuentas</h3>
<p>Para una experiencia personalizada y el seguimiento de pedidos, el Usuario debe crear una cuenta de acceso.</p>
<ul>
  <li><strong>Responsabilidad del Usuario:</strong> El Usuario es el único responsable de mantener la confidencialidad de su contraseña y de toda la actividad que ocurra bajo su cuenta.</li>
  <li><strong>Exactitud de la Información:</strong> El Usuario garantiza que todos los datos proporcionados son veraces, actuales y completos. El Prestador se deslinda de cualquier retraso en la entrega derivado de información incorrecta proporcionada por el Usuario.</li>
  <li><strong>Tratamiento de Datos:</strong> La información personal será tratada bajo los más altos estándares de seguridad, cumpliendo con la <strong>LFPDPPP</strong>. Los datos bancarios son procesados por pasarelas externas con certificación <strong>PCI-DSS</strong>; <strong>Vitis & Byte</strong> no almacena información sensible de tarjetas de crédito o débito.</li>
</ul>

<h3>4. Propiedad Intelectual</h3>
<ul>
  <li><strong>Código Fuente y Software:</strong> El código fuente desarrollado, así como la estructura de la base de datos, algoritmos de gestión de inventario y lógica de cálculo de impuestos (<strong>IEPS</strong>), son propiedad intelectual exclusiva de <strong>Ulises Alberto Macías Ramírez</strong> y <strong>Daniel Eduardo Pelayo Gómez</strong>. Queda prohibida cualquier forma de ingeniería inversa, descompilación o copia del código.</li>
  <li><strong>Contenidos y Marca:</strong> El nombre "Vitis & Byte", los logotipos, el diseño de la interfaz (UI/UX) y las descripciones del catálogo están protegidos por la <strong>Ley Federal del Derecho de Autor</strong> y la <strong>Ley de la Propiedad Industrial</strong>.</li>
</ul>

<h3>5. Limitación de Responsabilidad</h3>
<ul>
  <li><strong>Responsabilidad sobre Menores de Edad:</strong> El Prestador se deslinda de cualquier responsabilidad legal derivada del acceso o compra por parte de personas que proporcionen información falsa sobre su edad. Como medida definitiva, al momento de la entrega se exigirá identificación oficial vigente.</li>
  <li><strong>Fallas Tecnológicas:</strong> El Prestador no será responsable por interrupciones temporales del servicio debidas a fallas en el proveedor de hosting, ataques DDoS o mantenimientos programados.</li>
  <li><strong>Consumo Responsable:</strong> El Prestador cumple con todas las normas de etiquetado y venta, pero se deslinda de cualquier responsabilidad derivada del consumo excesivo o imprudente de los productos adquiridos.</li>
  <li><strong>Integridad de los Productos:</strong> El Prestador garantiza la calidad de origen conforme a la <strong>NOM-142</strong>. No se hace responsable por alteraciones en el producto derivadas de un almacenamiento inadecuado por parte del Usuario una vez entregada la mercancía.</li>
  <li><strong>Disputas de Pago:</strong> Cualquier aclaración sobre cargos no reconocidos deberá ser tramitada directamente con la institución bancaria emisora o con la pasarela de pagos correspondiente.</li>
</ul>

<h3>6. Modificaciones</h3>
<p>El Prestador se reserva el derecho de actualizar o modificar estos Términos y Condiciones en cualquier momento para ajustarse a cambios en la legislación o mejoras en la tecnología de la plataforma. Cualquier cambio sustancial será notificado al Usuario a través del correo electrónico registrado. El uso continuado de la plataforma tras la publicación de los cambios constituye la aceptación plena de los nuevos términos.</p>

<hr>

<h2>Anexo Fiscal: Mecanismo de Cálculo e Imposición Tributaria</h2>
<p>Este anexo forma parte integrante de los Términos y Condiciones de <strong>Vitis & Byte</strong> y tiene como objetivo desglosar la metodología matemática y legal aplicada a cada transacción.</p>

<h3>1. Fundamentación Legal del Gravamen</h3>
<ul>
  <li><strong>Ley del IEPS (Art. 2, Fracción I, Inciso A):</strong> Establece las tasas aplicables según la graduación alcohólica del producto.</li>
  <li><strong>Ley del IVA (Art. 1):</strong> Establece la tasa general del 16% sobre el valor de la contraprestación, la cual incluye el monto del IEPS.</li>
  <li><strong>Código Fiscal de la Federación (CFF):</strong> Regula la emisión de Comprobantes Fiscales Digitales por Internet (CFDI) versión 4.0.</li>
</ul>

<h3>2. Tabla de Tasas IEPS Aplicadas</h3>
<table>
  <thead>
    <tr><th>Graduación Alcohólica</th><th>Tasa de IEPS Aplicable</th></tr>
  </thead>
  <tbody>
    <tr><td>Hasta 14° G.L.</td><td><strong>26.5%</strong></td></tr>
    <tr><td>Más de 14° y hasta 20° G.L.</td><td><strong>30.0%</strong></td></tr>
    <tr><td>Más de 20° G.L.</td><td><strong>53.0%</strong></td></tr>
  </tbody>
</table>

<h3>3. Algoritmo de Cálculo de Precio Final</h3>
<p>El sistema sigue una estructura de cascada fiscal:</p>
<ol>
  <li><strong>Precio Neto (Base):</strong> Valor comercial antes de impuestos.</li>
  <li><strong>Cálculo del IEPS:</strong> Se multiplica el Precio Neto por la tasa correspondiente.</li>
  <li><strong>Base Gravable para IVA:</strong> Precio Neto + IEPS.</li>
  <li><strong>Cálculo del IVA:</strong> Se aplica el 16% sobre la Base Gravable.</li>
  <li><strong>Precio Total al Público:</strong> Suma final de todos los conceptos anteriores.</li>
</ol>

<h3>4. Transparencia en el Comprobante de Pago</h3>
<p>En cumplimiento con el <strong>Artículo 76 Bis de la LFPC</strong>, el desglose en el checkout mostrará de forma separada: Subtotal, IEPS, IVA (16%), costo de envío y Total Final.</p>

<h3>5. Obligaciones de Facturación (CFDI 4.0)</h3>
<p><strong>Vitis & Byte</strong> permite la emisión de facturas electrónicas automatizadas. El Usuario es responsable de proporcionar el RFC, Régimen Fiscal y Código Postal correctos. El sistema validará estos datos contra las listas del SAT en tiempo real para evitar errores de timbrado.</p>
`;
