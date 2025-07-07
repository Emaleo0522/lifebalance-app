// Sistema de frases dinámicas para LifeBalance
// Se rotan automáticamente cada vez que se cambia de vista

export interface Quote {
  id: number;
  text: string;
  category: 'motivational' | 'focus' | 'financial';
}

// 100+ Frases Motivacionales
export const motivationalQuotes: Quote[] = [
  { id: 1, text: "Haz que cada minuto cuente hoy.", category: 'motivational' },
  { id: 2, text: "Los pequeños pasos llevan a grandes cambios.", category: 'motivational' },
  { id: 3, text: "Enfócate en el progreso, no en la perfección.", category: 'motivational' },
  { id: 4, text: "Tu tiempo es limitado, úsalo sabiamente.", category: 'motivational' },
  { id: 5, text: "El equilibrio no es algo que encuentras, es algo que creas.", category: 'motivational' },
  { id: 6, text: "Cada día es una nueva oportunidad para ser mejor.", category: 'motivational' },
  { id: 7, text: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.", category: 'motivational' },
  { id: 8, text: "No esperes el momento perfecto, toma el momento y hazlo perfecto.", category: 'motivational' },
  { id: 9, text: "La disciplina es elegir entre lo que quieres ahora y lo que quieres más.", category: 'motivational' },
  { id: 10, text: "Tu única limitación eres tú mismo.", category: 'motivational' },
  { id: 11, text: "Cada fracaso es un paso más cerca del éxito.", category: 'motivational' },
  { id: 12, text: "La consistencia es la madre de la maestría.", category: 'motivational' },
  { id: 13, text: "Hoy es el primer día del resto de tu vida.", category: 'motivational' },
  { id: 14, text: "Los sueños no funcionan a menos que tú lo hagas.", category: 'motivational' },
  { id: 15, text: "La diferencia entre ordinario y extraordinario es ese pequeño extra.", category: 'motivational' },
  { id: 16, text: "No puedes volver atrás y cambiar el comienzo, pero puedes empezar donde estás y cambiar el final.", category: 'motivational' },
  { id: 17, text: "El momento de plantar un árbol fue hace 20 años. El segundo mejor momento es ahora.", category: 'motivational' },
  { id: 18, text: "La vida es 10% lo que te pasa y 90% cómo reaccionas a ello.", category: 'motivational' },
  { id: 19, text: "Si quieres algo que nunca has tenido, debes hacer algo que nunca has hecho.", category: 'motivational' },
  { id: 20, text: "El fracaso es el condimento que da sabor al éxito.", category: 'motivational' },
  { id: 21, text: "No te compares con otros. Compárate con quien eras ayer.", category: 'motivational' },
  { id: 22, text: "La motivación te pone en marcha, el hábito te mantiene en movimiento.", category: 'motivational' },
  { id: 23, text: "Una meta sin un plan es solo un deseo.", category: 'motivational' },
  { id: 24, text: "El camino de mil kilómetros comienza con un solo paso.", category: 'motivational' },
  { id: 25, text: "No necesitas ser genial para empezar, pero necesitas empezar para ser genial.", category: 'motivational' },
  { id: 26, text: "La única manera de hacer un gran trabajo es amar lo que haces.", category: 'motivational' },
  { id: 27, text: "El pesimista ve dificultad en cada oportunidad. El optimista ve oportunidad en cada dificultad.", category: 'motivational' },
  { id: 28, text: "No puedes controlar lo que pasa, pero sí puedes controlar cómo respondes.", category: 'motivational' },
  { id: 29, text: "La perseverancia es la llave de oro que abre cualquier puerta.", category: 'motivational' },
  { id: 30, text: "Cada experto fue una vez un principiante.", category: 'motivational' },
  { id: 31, text: "La paciencia, persistencia y transpiración hacen una combinación imbatible para el éxito.", category: 'motivational' },
  { id: 32, text: "El éxito no es la clave de la felicidad. La felicidad es la clave del éxito.", category: 'motivational' },
  { id: 33, text: "Tu actitud determina tu altitud.", category: 'motivational' },
  { id: 34, text: "Los obstáculos son esas cosas espantosas que ves cuando apartas los ojos de tu meta.", category: 'motivational' },
  { id: 35, text: "El único imposible es aquel que no intentas.", category: 'motivational' },
  { id: 36, text: "Cree en ti mismo y todo será posible.", category: 'motivational' },
  { id: 37, text: "El éxito es caminar de fracaso en fracaso sin perder el entusiasmo.", category: 'motivational' },
  { id: 38, text: "No dejes que lo que no puedes hacer interfiera con lo que sí puedes hacer.", category: 'motivational' },
  { id: 39, text: "La vida recompensa la acción.", category: 'motivational' },
  { id: 40, text: "El único lugar donde el éxito viene antes que el trabajo es en el diccionario.", category: 'motivational' },
  { id: 41, text: "Haz algo hoy que tu yo del futuro te agradezca.", category: 'motivational' },
  { id: 42, text: "La excelencia no es una habilidad, es una actitud.", category: 'motivational' },
  { id: 43, text: "Todo progreso tiene lugar fuera de la zona de confort.", category: 'motivational' },
  { id: 44, text: "El coraje no es la ausencia de miedo, sino la acción a pesar del miedo.", category: 'motivational' },
  { id: 45, text: "Las oportunidades no suceden. Las creas.", category: 'motivational' },
  { id: 46, text: "Tu limitación—es solo tu imaginación.", category: 'motivational' },
  { id: 47, text: "Los grandes logros requieren grandes ambiciones.", category: 'motivational' },
  { id: 48, text: "El momento perfecto nunca llega. Actúa ahora.", category: 'motivational' },
  { id: 49, text: "Convierte tus heridas en sabiduría.", category: 'motivational' },
  { id: 50, text: "La vida es como andar en bicicleta. Para mantener el equilibrio, debes seguir moviéndote.", category: 'motivational' },
  { id: 51, text: "No cuentes los días, haz que los días cuenten.", category: 'motivational' },
  { id: 52, text: "La única forma de hacer lo imposible es creer que es posible.", category: 'motivational' },
  { id: 53, text: "Los líderes se hacen, no nacen.", category: 'motivational' },
  { id: 54, text: "El futuro pertenece a quienes creen en la belleza de sus sueños.", category: 'motivational' },
  { id: 55, text: "No te rindas. El comienzo siempre es lo más difícil.", category: 'motivational' },
  { id: 56, text: "La felicidad no es un destino, es una forma de vida.", category: 'motivational' },
  { id: 57, text: "El secreto del cambio es enfocar toda tu energía no en luchar contra lo viejo, sino en construir lo nuevo.", category: 'motivational' },
  { id: 58, text: "Una actitud positiva puede convertir una tormenta en un arcoíris.", category: 'motivational' },
  { id: 59, text: "El tiempo que disfrutas perder no es tiempo perdido.", category: 'motivational' },
  { id: 60, text: "Eres más fuerte de lo que crees, más capaz de lo que imaginas.", category: 'motivational' },
  { id: 61, text: "La creatividad es la inteligencia divirtiéndose.", category: 'motivational' },
  { id: 62, text: "Cada nuevo día es una oportunidad de cambiar tu vida.", category: 'motivational' },
  { id: 63, text: "El progreso, no la perfección, es la meta.", category: 'motivational' },
  { id: 64, text: "Los retos hacen la vida interesante; superarlos la hace significativa.", category: 'motivational' },
  { id: 65, text: "Tu vida no mejora por casualidad, mejora por cambio.", category: 'motivational' },
  { id: 66, text: "La autodisciplina es hacer lo que necesitas hacer, cuando lo necesitas hacer, aunque no tengas ganas de hacerlo.", category: 'motivational' },
  { id: 67, text: "El miedo tiene dos significados: 'Olvida Todo Y Corre' o 'Enfrenta Todo Y Crece'. Tú eliges.", category: 'motivational' },
  { id: 68, text: "No esperes a que otros hagan lo que tú puedes hacer hoy.", category: 'motivational' },
  { id: 69, text: "La vida es una aventura atrevida o no es nada.", category: 'motivational' },
  { id: 70, text: "El éxito es la recompensa de aquellos que se mantienen firmes cuando otros se rinden.", category: 'motivational' },
  { id: 71, text: "Cada día trae nuevas elecciones.", category: 'motivational' },
  { id: 72, text: "La mejor venganza es un éxito masivo.", category: 'motivational' },
  { id: 73, text: "Trabaja duro en silencio, deja que tu éxito haga el ruido.", category: 'motivational' },
  { id: 74, text: "La vida no se trata de encontrarte a ti mismo. Se trata de crearte a ti mismo.", category: 'motivational' },
  { id: 75, text: "Si no construyes tu sueño, alguien más te contratará para ayudar a construir el suyo.", category: 'motivational' },
  { id: 76, text: "La decisión más difícil es la que cambia tu vida para siempre.", category: 'motivational' },
  { id: 77, text: "No permitas que lo que no puedes hacer hoy interfiera con lo que sí puedes hacer.", category: 'motivational' },
  { id: 78, text: "El éxito es un proceso, no un evento.", category: 'motivational' },
  { id: 79, text: "Conviértete en la persona que necesitas ser para conseguir lo que quieres.", category: 'motivational' },
  { id: 80, text: "La vida es demasiado importante para tomársela en serio.", category: 'motivational' },
  { id: 81, text: "No puedes tener un arcoíris sin un poco de lluvia.", category: 'motivational' },
  { id: 82, text: "El único fracaso real es no intentarlo.", category: 'motivational' },
  { id: 83, text: "Tus únicas limitaciones son las que te pones a ti mismo.", category: 'motivational' },
  { id: 84, text: "Haz hoy lo que otros no harán, y tendrás mañana lo que otros no tendrán.", category: 'motivational' },
  { id: 85, text: "La diferencia entre lo imposible y lo posible está en la determinación.", category: 'motivational' },
  { id: 86, text: "No busques la felicidad, créala.", category: 'motivational' },
  { id: 87, text: "El cambio es el resultado final de todo verdadero aprendizaje.", category: 'motivational' },
  { id: 88, text: "Sé tú mismo; todos los demás ya están ocupados.", category: 'motivational' },
  { id: 89, text: "La vida es como un eco; lo que envías, regresa.", category: 'motivational' },
  { id: 90, text: "El optimismo es la fe que lleva al logro.", category: 'motivational' },
  { id: 91, text: "La única persona que puedes controlar eres tú.", category: 'motivational' },
  { id: 92, text: "Los milagros empiezan a suceder cuando das tanto a tus sueños como a tus miedos.", category: 'motivational' },
  { id: 93, text: "El fracaso es simplemente la oportunidad de comenzar de nuevo, esta vez de forma más inteligente.", category: 'motivational' },
  { id: 94, text: "No esperes el momento perfecto, toma el momento y hazlo perfecto.", category: 'motivational' },
  { id: 95, text: "La vida es 10% lo que me pasa y 90% cómo reacciono a ello.", category: 'motivational' },
  { id: 96, text: "Tu tiempo es limitado, no lo desperdicies viviendo la vida de otra persona.", category: 'motivational' },
  { id: 97, text: "El secreto para salir adelante es comenzar.", category: 'motivational' },
  { id: 98, text: "Nunca es demasiado tarde para ser lo que podrías haber sido.", category: 'motivational' },
  { id: 99, text: "La acción es la clave fundamental para todo éxito.", category: 'motivational' },
  { id: 100, text: "Sueña en grande y atrévete a fallar.", category: 'motivational' },
  { id: 101, text: "El camino hacia el éxito está siempre en construcción.", category: 'motivational' },
  { id: 102, text: "La grandeza nunca viene de la zona de confort.", category: 'motivational' },
  { id: 103, text: "Cada final es un nuevo comienzo.", category: 'motivational' },
  { id: 104, text: "Convierte tus obstáculos en oportunidades.", category: 'motivational' },
  { id: 105, text: "El único lugar donde los sueños son imposibles es en tu propia mente.", category: 'motivational' },
];

// 100+ Consejos Antiprocrastinación y Enfoque
export const focusQuotes: Quote[] = [
  { id: 1, text: "Usa la Técnica Pomodoro: 25 minutos de enfoque seguidos de un descanso de 5 minutos.", category: 'focus' },
  { id: 2, text: "Pon tu teléfono en otra habitación o activa el modo No Molestar.", category: 'focus' },
  { id: 3, text: "Cierra todas las pestañas y aplicaciones innecesarias mientras trabajas.", category: 'focus' },
  { id: 4, text: "Usa extensiones del navegador para bloquear sitios web que distraen.", category: 'focus' },
  { id: 5, text: "Mantente hidratado y toma descansos cortos de movimiento entre sesiones.", category: 'focus' },
  { id: 6, text: "Divide las tareas grandes en pasos más pequeños y manejables.", category: 'focus' },
  { id: 7, text: "Establece metas específicas y medibles para cada sesión de trabajo.", category: 'focus' },
  { id: 8, text: "Crea un ambiente de trabajo libre de distracciones visuales.", category: 'focus' },
  { id: 9, text: "Usa música instrumental o ruido blanco para mejorar la concentración.", category: 'focus' },
  { id: 10, text: "Planifica tu día más difícil para cuando tengas más energía.", category: 'focus' },
  { id: 11, text: "Recompénsate después de completar tareas importantes.", category: 'focus' },
  { id: 12, text: "Usa la regla de los 2 minutos: si algo toma menos de 2 minutos, hazlo ahora.", category: 'focus' },
  { id: 13, text: "Elimina las multitareas; enfócate en una cosa a la vez.", category: 'focus' },
  { id: 14, text: "Prepara todo lo que necesitas antes de comenzar a trabajar.", category: 'focus' },
  { id: 15, text: "Establece horarios específicos para revisar emails y redes sociales.", category: 'focus' },
  { id: 16, text: "Usa la técnica de time-boxing para asignar tiempo específico a cada tarea.", category: 'focus' },
  { id: 17, text: "Practica la meditación de 5 minutos antes de comenzar el trabajo.", category: 'focus' },
  { id: 18, text: "Mantén tu área de trabajo ordenada y organizada.", category: 'focus' },
  { id: 19, text: "Usa la técnica del 'batching' - agrupa tareas similares juntas.", category: 'focus' },
  { id: 20, text: "Identifica y evita tus principales desencadenantes de procrastinación.", category: 'focus' },
  { id: 21, text: "Establece deadlines realistas pero desafiantes para tus proyectos.", category: 'focus' },
  { id: 22, text: "Usa aplicaciones de bloqueo de sitios web durante horas de trabajo.", category: 'focus' },
  { id: 23, text: "Toma descansos regulares para evitar el agotamiento mental.", category: 'focus' },
  { id: 24, text: "Visualiza el resultado final antes de comenzar una tarea.", category: 'focus' },
  { id: 25, text: "Usa la técnica de 'eat the frog' - haz primero lo más difícil.", category: 'focus' },
  { id: 26, text: "Mantén una lista de tareas pendientes actualizada y visible.", category: 'focus' },
  { id: 27, text: "Elimina las notificaciones innecesarias de tu teléfono y computadora.", category: 'focus' },
  { id: 28, text: "Usa un temporizador para crear urgencia artificial en las tareas.", category: 'focus' },
  { id: 29, text: "Practica la respiración profunda cuando te sientas abrumado.", category: 'focus' },
  { id: 30, text: "Crea rituales de inicio y fin para marcar el comienzo y final del trabajo.", category: 'focus' },
  { id: 31, text: "Usa la técnica de 'working backwards' - planifica desde el resultado final.", category: 'focus' },
  { id: 32, text: "Elimina las decisiones innecesarias automatizando rutinas diarias.", category: 'focus' },
  { id: 33, text: "Usa la iluminación adecuada para mantener tu estado de alerta.", category: 'focus' },
  { id: 34, text: "Aplica la regla 80/20: enfócate en el 20% que produce el 80% de resultados.", category: 'focus' },
  { id: 35, text: "Programa bloques de tiempo específicos para trabajo profundo.", category: 'focus' },
  { id: 36, text: "Usa técnicas de gamificación para hacer las tareas más atractivas.", category: 'focus' },
  { id: 37, text: "Mantén un registro de tus patrones de productividad diarios.", category: 'focus' },
  { id: 38, text: "Establece límites claros entre tiempo de trabajo y tiempo personal.", category: 'focus' },
  { id: 39, text: "Usa la técnica de 'single-tasking' para mejorar la calidad del trabajo.", category: 'focus' },
  { id: 40, text: "Crea un espacio de trabajo dedicado exclusivamente al trabajo.", category: 'focus' },
  { id: 41, text: "Practica la técnica de 'mind mapping' para organizar ideas complejas.", category: 'focus' },
  { id: 42, text: "Usa recordatorios visuales para mantener tus objetivos presentes.", category: 'focus' },
  { id: 43, text: "Aplica el principio de 'menos es más' - simplifica tus procesos.", category: 'focus' },
  { id: 44, text: "Programa reuniones más cortas y enfocadas en objetivos específicos.", category: 'focus' },
  { id: 45, text: "Usa la técnica de 'implementation intentions' - planifica cuándo y dónde harás algo.", category: 'focus' },
  { id: 46, text: "Mantén snacks saludables cerca para evitar interrupciones por hambre.", category: 'focus' },
  { id: 47, text: "Usa la técnica de 'timeboxing' para limitar el tiempo en cada actividad.", category: 'focus' },
  { id: 48, text: "Practica ejercicios de estiramiento durante los descansos.", category: 'focus' },
  { id: 49, text: "Usa herramientas de productividad que se adapten a tu estilo de trabajo.", category: 'focus' },
  { id: 50, text: "Establece metas diarias específicas y realistas.", category: 'focus' },
  { id: 51, text: "Usa la técnica de 'anchoring' - asocia el trabajo con señales específicas.", category: 'focus' },
  { id: 52, text: "Mantén una temperatura ambiente cómoda en tu espacio de trabajo.", category: 'focus' },
  { id: 53, text: "Practica la técnica de 'deliberate practice' para mejorar habilidades específicas.", category: 'focus' },
  { id: 54, text: "Usa la regla de 'no excepciones' para mantener la consistencia en hábitos.", category: 'focus' },
  { id: 55, text: "Programa tiempo para reflexionar sobre tu progreso diario.", category: 'focus' },
  { id: 56, text: "Usa la técnica de 'micro-learning' para aprender en pequeños incrementos.", category: 'focus' },
  { id: 57, text: "Elimina las opciones que no agregan valor a tus objetivos principales.", category: 'focus' },
  { id: 58, text: "Usa la técnica de 'systematic procrastination' - pospón tareas menos importantes.", category: 'focus' },
  { id: 59, text: "Mantén un diario de productividad para identificar patrones y mejoras.", category: 'focus' },
  { id: 60, text: "Usa colores y elementos visuales para organizar y priorizar tareas.", category: 'focus' },
  { id: 61, text: "Practica la técnica de 'mental rehearsal' antes de tareas importantes.", category: 'focus' },
  { id: 62, text: "Establece rituales de transición entre diferentes tipos de trabajo.", category: 'focus' },
  { id: 63, text: "Usa la técnica de 'productive procrastination' - haz otra tarea productiva cuando evites una.", category: 'focus' },
  { id: 64, text: "Mantén herramientas y recursos organizados para acceso rápido.", category: 'focus' },
  { id: 65, text: "Usa la técnica de 'cognitive load reduction' - minimiza decisiones innecesarias.", category: 'focus' },
  { id: 66, text: "Programa descansos activos que involucren movimiento físico.", category: 'focus' },
  { id: 67, text: "Usa la técnica de 'energy management' - alinea tareas con niveles de energía.", category: 'focus' },
  { id: 68, text: "Establece límites de tiempo para actividades que tienden a expandirse.", category: 'focus' },
  { id: 69, text: "Usa la técnica de 'habit stacking' - conecta nuevos hábitos con existentes.", category: 'focus' },
  { id: 70, text: "Mantén un espacio limpio y minimalista para reducir distracciones.", category: 'focus' },
  { id: 71, text: "Practica la técnica de 'attention restoration' con actividades relajantes.", category: 'focus' },
  { id: 72, text: "Usa recordatorios automáticos para mantener rutinas importantes.", category: 'focus' },
  { id: 73, text: "Establece 'office hours' específicas para estar disponible para otros.", category: 'focus' },
  { id: 74, text: "Usa la técnica de 'progressive disclosure' - revela información gradualmente.", category: 'focus' },
  { id: 75, text: "Programa tiempo específico para planificación y revisión semanal.", category: 'focus' },
  { id: 76, text: "Usa la técnica de 'constraint-based thinking' - trabaja dentro de limitaciones claras.", category: 'focus' },
  { id: 77, text: "Mantén un equilibrio entre estructura y flexibilidad en tu horario.", category: 'focus' },
  { id: 78, text: "Usa la técnica de 'productive defaults' - establece opciones automáticas productivas.", category: 'focus' },
  { id: 79, text: "Practica la pausa de 3 segundos antes de cambiar a una nueva actividad.", category: 'focus' },
  { id: 80, text: "Usa herramientas de seguimiento de tiempo para identificar pérdidas de tiempo.", category: 'focus' },
  { id: 81, text: "Establece señales claras para cuando no estés disponible para interrupciones.", category: 'focus' },
  { id: 82, text: "Usa la técnica de 'implementation loops' - planifica, ejecuta, evalúa, ajusta.", category: 'focus' },
  { id: 83, text: "Mantén versiones simplificadas de procesos complejos.", category: 'focus' },
  { id: 84, text: "Usa la técnica de 'cognitive offloading' - externaliza memoria en herramientas.", category: 'focus' },
  { id: 85, text: "Programa tiempo para mantenimiento y organización de herramientas de trabajo.", category: 'focus' },
  { id: 86, text: "Usa la técnica de 'systematic elimination' - elimina gradualmente distracciones.", category: 'focus' },
  { id: 87, text: "Establece indicadores claros de progreso para tareas de largo plazo.", category: 'focus' },
  { id: 88, text: "Usa la técnica de 'attention switching costs' - minimiza cambios de contexto.", category: 'focus' },
  { id: 89, text: "Mantén un kit de emergencia para situaciones de baja productividad.", category: 'focus' },
  { id: 90, text: "Usa la técnica de 'productive rituals' - crea secuencias automáticas de acciones.", category: 'focus' },
  { id: 91, text: "Programa revisiones regulares de metas y ajusta estrategias según necesidad.", category: 'focus' },
  { id: 92, text: "Usa la técnica de 'selective ignorance' - ignora información irrelevante.", category: 'focus' },
  { id: 93, text: "Establece sistemas de backup para cuando las herramientas principales fallen.", category: 'focus' },
  { id: 94, text: "Usa la técnica de 'momentum building' - comienza con tareas fáciles para ganar impulso.", category: 'focus' },
  { id: 95, text: "Mantén un equilibrio entre perfeccionismo y eficiencia.", category: 'focus' },
  { id: 96, text: "Usa la técnica de 'context switching minimization' - agrupa tareas por contexto.", category: 'focus' },
  { id: 97, text: "Programa tiempo específico para creatividad y pensamiento libre.", category: 'focus' },
  { id: 98, text: "Usa la técnica de 'systematic experimentation' - prueba nuevos métodos regularmente.", category: 'focus' },
  { id: 99, text: "Establece límites claros para el tiempo dedicado a perfeccionar tareas.", category: 'focus' },
  { id: 100, text: "Usa la técnica de 'productive defaults' - automatiza decisiones frecuentes.", category: 'focus' },
  { id: 101, text: "Mantén un registro de técnicas que funcionan mejor para diferentes tipos de tareas.", category: 'focus' },
  { id: 102, text: "Usa la técnica de 'flow triggers' - identifica condiciones que facilitan el estado de flujo.", category: 'focus' },
  { id: 103, text: "Programa tiempo para descompresión mental al final del día de trabajo.", category: 'focus' },
  { id: 104, text: "Usa la técnica de 'systematic skill building' - mejora una habilidad específica a la vez.", category: 'focus' },
  { id: 105, text: "Establece rituales de cierre para marcar la transición entre trabajo y descanso.", category: 'focus' },
];

// 100+ Consejos Financieros
export const financialQuotes: Quote[] = [
  { id: 1, text: "Paga primero las deudas con intereses altos para ahorrar dinero a largo plazo.", category: 'financial' },
  { id: 2, text: "Crea un presupuesto y síguelo - prueba la regla 50/30/20 (necesidades/deseos/ahorros).", category: 'financial' },
  { id: 3, text: "Elimina gastos innecesarios como suscripciones que rara vez usas.", category: 'financial' },
  { id: 4, text: "Configura pagos automáticos para facturas para evitar cargos por mora.", category: 'financial' },
  { id: 5, text: "Construye un fondo de emergencia para cubrir al menos 3-6 meses de gastos.", category: 'financial' },
  { id: 6, text: "Invierte en tu educación financiera - es la mejor inversión que puedes hacer.", category: 'financial' },
  { id: 7, text: "Compara precios antes de hacer compras grandes - incluso el 10% de ahorro suma.", category: 'financial' },
  { id: 8, text: "Usa la regla de 24 horas antes de compras no planificadas mayores a $100.", category: 'financial' },
  { id: 9, text: "Aprovecha los beneficios de empleador como 401k matching - es dinero gratis.", category: 'financial' },
  { id: 10, text: "Revisa y negocia tus facturas regularmente - seguro, teléfono, internet.", category: 'financial' },
  { id: 11, text: "Cocina en casa más frecuentemente - puede ahorrarte miles al año.", category: 'financial' },
  { id: 12, text: "Usa aplicaciones de cashback y cupones para compras habituales.", category: 'financial' },
  { id: 13, text: "Diversifica tus inversiones - no pongas todos los huevos en una canasta.", category: 'financial' },
  { id: 14, text: "Paga más del mínimo en préstamos para reducir intereses totales.", category: 'financial' },
  { id: 15, text: "Rastrea todos tus gastos durante al menos un mes para identificar patrones.", category: 'financial' },
  { id: 16, text: "Usa la técnica de 'paga a ti mismo primero' - ahorra antes de gastar.", category: 'financial' },
  { id: 17, text: "Compra genéricos cuando la calidad sea comparable al producto de marca.", category: 'financial' },
  { id: 18, text: "Evita usar tarjetas de crédito para gastos diarios si no puedes pagarlas completamente.", category: 'financial' },
  { id: 19, text: "Invierte en experiencias que aporten valor duradero, no solo en cosas materiales.", category: 'financial' },
  { id: 20, text: "Mantén separadas las cuentas de gastos y ahorros para evitar tentaciones.", category: 'financial' },
  { id: 21, text: "Usa el método de sobre para categorías donde gastas de más.", category: 'financial' },
  { id: 22, text: "Compra artículos de segunda mano cuando sea práctico - autos, muebles, libros.", category: 'financial' },
  { id: 23, text: "Negocia tu salario regularmente basándote en tu valor de mercado.", category: 'financial' },
  { id: 24, text: "Considera el costo por uso antes de comprar - ¿cuánto pagarás por cada vez que lo uses?", category: 'financial' },
  { id: 25, text: "Automatiza tus ahorros e inversiones para eliminar la tentación de gastar.", category: 'financial' },
  { id: 26, text: "Usa herramientas de presupuesto digital para monitorear gastos en tiempo real.", category: 'financial' },
  { id: 27, text: "Compra seguros adecuados - es protección, no gasto innecesario.", category: 'financial' },
  { id: 28, text: "Evita financiamientos a largo plazo para artículos que se deprecian rápidamente.", category: 'financial' },
  { id: 29, text: "Desarrolla múltiples fuentes de ingresos para mayor seguridad financiera.", category: 'financial' },
  { id: 30, text: "Invierte en herramientas y educación que aumenten tu capacidad de ganar dinero.", category: 'financial' },
  { id: 31, text: "Usa la estrategia de 'avalancha de deudas' - paga primero las de mayor interés.", category: 'financial' },
  { id: 32, text: "Planifica compras estacionales con anticipación para aprovechar ofertas.", category: 'financial' },
  { id: 33, text: "Mantén registros detallados para impuestos y posibles deducciones.", category: 'financial' },
  { id: 34, text: "Evalúa el verdadero costo de conveniencia - delivery, servicios premium.", category: 'financial' },
  { id: 35, text: "Usa cuentas de ahorro con propósito específico para diferentes metas.", category: 'financial' },
  { id: 36, text: "Compra en cantidad solo si realmente vas a usar todo antes de que expire.", category: 'financial' },
  { id: 37, text: "Revisa tu reporte de crédito regularmente y corrige errores inmediatamente.", category: 'financial' },
  { id: 38, text: "Considera el costo de oportunidad - ¿qué más podrías hacer con ese dinero?", category: 'financial' },
  { id: 39, text: "Usa la regla del 1% para el fondo de emergencia del hogar (1% del valor del hogar anualmente).", category: 'financial' },
  { id: 40, text: "Negocia mejores tasas con proveedores de servicios regularmente.", category: 'financial' },
  { id: 41, text: "Invierte de forma consistente, independientemente de las condiciones del mercado.", category: 'financial' },
  { id: 42, text: "Usa aplicaciones de inversión automática para empezar con pequeñas cantidades.", category: 'financial' },
  { id: 43, text: "Mantén gastos fijos por debajo del 50% de tus ingresos.", category: 'financial' },
  { id: 44, text: "Aprovecha descuentos por pago anual en servicios que usas regularmente.", category: 'financial' },
  { id: 45, text: "Educa a tu familia sobre finanzas para que todos trabajen hacia los mismos objetivos.", category: 'financial' },
  { id: 46, text: "Usa la técnica de 'zero-based budgeting' - justifica cada gasto mensualmente.", category: 'financial' },
  { id: 47, text: "Compra calidad en artículos que usas frecuentemente, ahorra en los que usas poco.", category: 'financial' },
  { id: 48, text: "Mantén un registro de net worth para ver tu progreso financiero general.", category: 'financial' },
  { id: 49, text: "Usa tarjetas de crédito con recompensas solo si pagas el balance completo mensualmente.", category: 'financial' },
  { id: 50, text: "Planifica para gastos irregulares - mantenimiento de auto, regalos, vacaciones.", category: 'financial' },
  { id: 51, text: "Usa la regla de los 3 precios - compara al menos 3 opciones antes de comprar.", category: 'financial' },
  { id: 52, text: "Invierte en mejoras del hogar que aumenten su valor de reventa.", category: 'financial' },
  { id: 53, text: "Usa servicios de transferencia de dinero económicos para envíos internacionales.", category: 'financial' },
  { id: 54, text: "Mantén efectivo para emergencias pequeñas y oportunidades inesperadas.", category: 'financial' },
  { id: 55, text: "Usa la técnica de 'dollar cost averaging' para inversiones en mercados volátiles.", category: 'financial' },
  { id: 56, text: "Evalúa el ROI de membresías y suscripciones premium regularmente.", category: 'financial' },
  { id: 57, text: "Usa aplicaciones para dividir gastos compartidos con familia y amigos.", category: 'financial' },
  { id: 58, text: "Mantén un presupuesto separado para gastos de entretenimiento y caprichos.", category: 'financial' },
  { id: 59, text: "Aprovecha programas de lealtad y puntos de tiendas donde compras regularmente.", category: 'financial' },
  { id: 60, text: "Usa herramientas de refinanciamiento cuando las tasas de interés bajen.", category: 'financial' },
  { id: 61, text: "Mantén documentos financieros importantes organizados y accesibles.", category: 'financial' },
  { id: 62, text: "Usa la técnica de 'bundling' para obtener descuentos en servicios múltiples.", category: 'financial' },
  { id: 63, text: "Planifica la jubilación desde temprano - el tiempo es tu mejor aliado.", category: 'financial' },
  { id: 64, text: "Usa calculadoras de préstamos para entender el costo real de financiamientos.", category: 'financial' },
  { id: 65, text: "Mantén un fondo separado para oportunidades de inversión inesperadas.", category: 'financial' },
  { id: 66, text: "Usa la regla del 28% - no gastes más del 28% de ingresos en vivienda.", category: 'financial' },
  { id: 67, text: "Aprovecha deducciones fiscales legales - donaciones, gastos de negocio, educación.", category: 'financial' },
  { id: 68, text: "Usa servicios de agregación financiera para ver todas tus cuentas en un lugar.", category: 'financial' },
  { id: 69, text: "Mantén un registro de gastos médicos para posibles deducciones fiscales.", category: 'financial' },
  { id: 70, text: "Usa la técnica de 'envelope method' digital para categorías problemáticas.", category: 'financial' },
  { id: 71, text: "Planifica compras grandes durante temporadas de descuentos.", category: 'financial' },
  { id: 72, text: "Usa aplicaciones de presupuesto que se sincronicen con tus cuentas bancarias.", category: 'financial' },
  { id: 73, text: "Mantén un equilibrio entre disfrutar hoy y ahorrar para el futuro.", category: 'financial' },
  { id: 74, text: "Usa la técnica de 'pay yourself first' - transfiere ahorros inmediatamente al recibir ingresos.", category: 'financial' },
  { id: 75, text: "Aprovecha descuentos por empleado si tu empresa tiene acuerdos con proveedores.", category: 'financial' },
  { id: 76, text: "Usa herramientas de seguimiento de gastos que categoricen automáticamente.", category: 'financial' },
  { id: 77, text: "Mantén un fondo para educación continua y desarrollo profesional.", category: 'financial' },
  { id: 78, text: "Usa la regla de 'una entrada, una salida' para evitar acumulación innecesaria.", category: 'financial' },
  { id: 79, text: "Planifica para gastos de mantenimiento preventivo - es más barato que reparaciones.", category: 'financial' },
  { id: 80, text: "Usa aplicaciones que redondeen compras y ahorren el cambio automáticamente.", category: 'financial' },
  { id: 81, text: "Mantén un registro de garantías y fechas de vencimiento de productos.", category: 'financial' },
  { id: 82, text: "Usa la técnica de 'cost per wear' para evaluar compras de ropa.", category: 'financial' },
  { id: 83, text: "Aprovecha mercados de segunda mano online para compras y ventas.", category: 'financial' },
  { id: 84, text: "Usa servicios de comparación de precios antes de compras importantes.", category: 'financial' },
  { id: 85, text: "Mantén un presupuesto flexible que pueda adaptarse a cambios inesperados.", category: 'financial' },
  { id: 86, text: "Usa la técnica de 'sinking funds' para gastos futuros conocidos.", category: 'financial' },
  { id: 87, text: "Planifica reuniones familiares regulares para revisar metas financieras.", category: 'financial' },
  { id: 88, text: "Usa herramientas de simulación para proyectar el crecimiento de inversiones.", category: 'financial' },
  { id: 89, text: "Mantén un equilibrio entre liquidez y rentabilidad en tus inversiones.", category: 'financial' },
  { id: 90, text: "Usa la técnica de 'reverse budgeting' - define ahorros primero, luego gastos.", category: 'financial' },
  { id: 91, text: "Aprovecha períodos de gracia en tarjetas de crédito para flujo de caja.", category: 'financial' },
  { id: 92, text: "Usa aplicaciones que analicen tus patrones de gasto y sugieran mejoras.", category: 'financial' },
  { id: 93, text: "Mantén un fondo para oportunidades de aprendizaje que mejoren tus ingresos.", category: 'financial' },
  { id: 94, text: "Usa la técnica de 'behavioral economics' - estructura tu entorno para decisiones financieras mejores.", category: 'financial' },
  { id: 95, text: "Planifica para la inflación en tus proyecciones financieras a largo plazo.", category: 'financial' },
  { id: 96, text: "Usa servicios de asesoría financiera cuando los beneficios superen los costos.", category: 'financial' },
  { id: 97, text: "Mantén un registro de lecciones aprendidas de errores financieros pasados.", category: 'financial' },
  { id: 98, text: "Usa la técnica de 'lifestyle inflation management' - aumenta gastos proporcionalmente a ingresos.", category: 'financial' },
  { id: 99, text: "Aprovecha tecnología para automatizar y optimizar decisiones financieras rutinarias.", category: 'financial' },
  { id: 100, text: "Mantén una perspectiva a largo plazo en decisiones financieras importantes.", category: 'financial' },
  { id: 101, text: "Usa la técnica de 'financial fire drills' - practica escenarios de emergencia financiera.", category: 'financial' },
  { id: 102, text: "Planifica para gastos estacionales con cuentas de ahorro específicas.", category: 'financial' },
  { id: 103, text: "Usa herramientas de educación financiera para mejorar continuamente tu conocimiento.", category: 'financial' },
  { id: 104, text: "Mantén un equilibrio entre conservadurismo y toma de riesgos calculados.", category: 'financial' },
  { id: 105, text: "Usa la técnica de 'value-based spending' - gasta en lo que realmente valoras.", category: 'financial' },
];

// Función para obtener una frase aleatoria por categoría
export const getRandomQuote = (category: Quote['category']): Quote => {
  let quotes: Quote[];
  
  switch (category) {
    case 'motivational':
      quotes = motivationalQuotes;
      break;
    case 'focus':
      quotes = focusQuotes;
      break;
    case 'financial':
      quotes = financialQuotes;
      break;
    default:
      quotes = motivationalQuotes;
  }
  
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
};

// Función para obtener múltiples frases aleatorias (útil para mostrar varios consejos)
export const getRandomQuotes = (category: Quote['category'], count: number): Quote[] => {
  let quotes: Quote[];
  
  switch (category) {
    case 'motivational':
      quotes = motivationalQuotes;
      break;
    case 'focus':
      quotes = focusQuotes;
      break;
    case 'financial':
      quotes = financialQuotes;
      break;
    default:
      quotes = motivationalQuotes;
  }
  
  // Mezclar el array y tomar los primeros 'count' elementos
  const shuffled = [...quotes].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Función para obtener una frase que no haya salido recientemente (usando localStorage)
export const getNewRandomQuote = (category: Quote['category'], storageKey: string): Quote => {
  const recentQuotesJson = localStorage.getItem(storageKey);
  const recentQuotes: number[] = recentQuotesJson ? JSON.parse(recentQuotesJson) : [];
  
  let quotes: Quote[];
  switch (category) {
    case 'motivational':
      quotes = motivationalQuotes;
      break;
    case 'focus':
      quotes = focusQuotes;
      break;
    case 'financial':
      quotes = financialQuotes;
      break;
    default:
      quotes = motivationalQuotes;
  }
  
  // Filtrar frases que no han salido recientemente
  const availableQuotes = quotes.filter(quote => !recentQuotes.includes(quote.id));
  
  // Si todas las frases han salido, resetear la lista
  if (availableQuotes.length === 0) {
    localStorage.setItem(storageKey, JSON.stringify([]));
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
  
  // Seleccionar una frase aleatoria de las disponibles
  const selectedQuote = availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
  
  // Agregar la frase seleccionada a la lista de recientes
  const maxRecentQuotes = Math.floor(quotes.length * 0.3); // 30% de las frases
  const updatedRecentQuotes = [selectedQuote.id, ...recentQuotes].slice(0, maxRecentQuotes);
  localStorage.setItem(storageKey, JSON.stringify(updatedRecentQuotes));
  
  return selectedQuote;
};