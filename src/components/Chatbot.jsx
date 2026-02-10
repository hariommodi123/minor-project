import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, X, Send, User, Bot, CheckCircle, CreditCard, Loader2, Calendar as CalendarIcon, RotateCcw } from 'lucide-react'
import axios from 'axios'
import { signInWithGoogle } from '../firebase'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const TRANSLATIONS = {
    'English': {
        welcome: 'Welcome to Museum Concierge. How can I assist you today?',
        start: 'Start Booking',
        langSelect: 'Which language would you prefer to continue in?',
        experience: 'What type of experience are you looking for?',
        experience: 'What type of experience are you looking for?',
        options: {},
        date: 'Excellent choice: {type}. For which date would you like to book?',
        guests: 'How many guests will be joining us today?',
        total: 'Total for {qty} guests: ₹{total}. Shall we proceed to secure payment?',
        confirmPay: 'Confirm & Pay',
        cancel: 'Cancel',
        signin: 'Please sign in with Google using the button in the top right to complete your booking.',
        paying: 'Proceeding to our secure gateway...',
        success: 'Payment Successful! Your digital golden key has been sent to your email.',
        confirmed: 'Booking Confirmed',
        error: 'Apologies, there was an issue securing your booking. Please try again.',
        cancelled: 'Payment cancelled or dismissed. No tickets were booked.',
        noted: 'No problem. Your booking has been cancelled. How else can I help?',
        reopen: 'This session has ended. To start a new booking, please reopen the concierge.',
        soldOut: 'Apologies, {type} is completely booked for {date}. Please select another date or experience.',
        signin: 'Please sign in with Google to complete your booking.',
        signinBtn: 'Sign In with Google',
        guestName: 'What is the full name of Guest #{index}?',
        guestGender: 'What is the gender of {name}?',
        guestAge: 'And what is the age of {name}?',
        genders: ['Male', 'Female', 'Other'],
        ageWarning: 'Please enter a valid age (number) for {name}.',
        notEnoughSpots: 'Apologies, there are only {available} spots remaining for this experience. Please enter a number between 1 and {available}.',
        invalidNumber: 'Please enter a valid number for the number of guests.'
    },
    'French': {
        welcome: 'Bienvenue au Concierge Museum. Comment puis-je vous aider aujourd\'hui ?',
        start: 'Démarrer la réservation',
        langSelect: 'Dans quelle langue préférez-vous continuer ?',
        experience: 'Quel type d\'expérience recherchez-vous ?',
        experience: 'Quel type d\'expérience recherchez-vous ?',
        options: {},
        date: 'Excellent choix : {type}. Pour quelle date souhaitez-vous réserver ?',
        guests: 'Combien d\'invités se joindront à nous aujourd\'hui ?',
        total: 'Total pour {qty} invités : ₹{total}. Allons-nous procéder au paiement sécurisé ?',
        confirmPay: 'Confirmer et payer',
        cancel: 'Annuler',
        signin: 'Veuillez vous connecter avec Google via le bouton en haut à droite pour finaliser votre réservation.',
        paying: 'Passage à notre passerelle sécurisée...',
        success: 'Paiement réussi ! Votre clé dorée numérique a été envoyée à votre adresse e-mail.',
        confirmed: 'Réservation confirmée',
        error: 'Toutes nos excuses, un problème est survenu lors de la sécurisation de votre réservation. Veuillez réessayer.',
        cancelled: 'Paiement annulé ou rejeté. Aucun billet n\'a été réservé.',
        noted: 'Pas de problème. Votre réservation a été annulée. Comment puis-je vous aider d\'autre ?',
        reopen: 'Cette séance est terminée. Pour recommencer une réservation, veuillez rouvrir le concierge.',
        soldOut: 'Désolé, {type} est complet pour le {date}. Veuillez choisir une autre date.',
        signin: 'Veuillez vous connecter avec Google pour finaliser votre réservation.',
        signinBtn: 'Se connecter avec Google',
        guestName: 'Quel est le nom complet de l\'invité n°{index} ?',
        guestGender: 'Quel est le sexe de {name} ?',
        guestAge: 'Et quel est l\'âge de {name} ?',
        genders: ['Masculin', 'Féminin', 'Autre'],
        ageWarning: 'Veuillez saisir un âge valide (nombre) pour {name}.',
        notEnoughSpots: 'Désolé, il ne reste que {available} places pour cette expérience. Veuillez saisir un nombre entre 1 et {available}.',
        invalidNumber: 'Veuillez saisir un nombre valide pour le nombre d\'invités.'
    },
    'Spanish': {
        welcome: 'Bienvenido a Concierge Museum. ¿Cómo puedo ayudarte hoy?',
        start: 'Comenzar reserva',
        langSelect: '¿En qué idioma preferiría continuar?',
        experience: '¿Qué tipo de experiencia estás buscando?',
        experience: '¿Qué tipo de experiencia estás buscando?',
        options: {},
        date: 'Excelente elección: {type}. ¿Para qué fecha te gustaría reservar?',
        guests: '¿Cuántos invitados se unirán a nosotros hoy?',
        total: 'Total para {qty} invitados: ₹{total}. ¿Procedemos al pago seguro?',
        confirmPay: 'Confirmar y pagar',
        cancel: 'Cancelar',
        signin: 'Inicie sesión con Google usando el botón en la parte superior derecha para completar su reserva.',
        paying: 'Pasando a nuestra pasarela segura...',
        success: '¡Pago exitoso! Su llave dorada digital ha sido enviada a su correo electrónico.',
        confirmed: 'Reserva confirmada',
        error: 'Disculpe, hubo un problema al asegurar su reserva. Por favor, inténtelo de nuevo.',
        cancelled: 'Pago cancelado o descartado. No se reservaron entradas.',
        noted: 'No hay problema. Su reserva ha sido cancelada. ¿En qué más puedo ayudarte?',
        reopen: 'Esta sesión ha finalizado. Para iniciar una nueva reserva, vuelva a abrir el conserje.',
        soldOut: 'Lo sentimos, {type} está lleno para el {date}. Por favor seleccione otra fecha.',
        signin: 'Inicie sesión con Google para completar su reserva.',
        signinBtn: 'Iniciar sesión con Google',
        guestName: '¿Cuál es el nombre completo del invitado #{index}?',
        guestGender: '¿Cuál es el género de {name}?',
        guestAge: '¿Y cuál es la edad de {name}?',
        genders: ['Masculino', 'Femenino', 'Otro'],
        ageWarning: 'Por favor, introduce una edad válida (número) para {name}.',
        notEnoughSpots: 'Lo sentimos, solo quedan {available} plazas para esta experiencia. Introduce un número entre 1 y {available}.',
        invalidNumber: 'Por favor, introduce un número válido para el número de invitados.'
    },
    'Hindi': {
        welcome: 'Museum द्वारपाल में आपका स्वागत है। मैं आज आपकी क्या सहायता कर सकता हूँ?',
        start: 'बुकिंग शुरू करें',
        langSelect: 'आप किस भाषा में आगे बढ़ना पसंद करेंगे?',
        experience: 'आप किस प्रकार का अनुभव खोज रहे हैं?',
        experience: 'आप किस प्रकार का अनुभव खोज रहे हैं?',
        options: {},
        date: 'उत्कृष्ट विकल्प: {type}। आप किस तारीख के लिए बुक करना चाहेंगे?',
        guests: 'आज हमारे साथ कितने मेहमान शामिल होंगे?',
        total: '{qty} मेहमानों के लिए कुल: ₹{total}। क्या हम सुरक्षित भुगतान के लिए आगे बढ़ें?',
        confirmPay: 'पुष्टि करें और भुगतान करें',
        cancel: 'रद्द करें',
        signin: 'कृपया अपनी बुकिंग पूरी करने के लिए ऊपर दाईं ओर दिए गए बटन का उपयोग करके Google के साथ साइन इन करें।',
        paying: 'हमारे सुरक्षित गेटवे पर आगे बढ़ रहे हैं...',
        success: 'भुगतान सफल! आपकी डिजिटल गोल्डन कुंजी आपके ईमेल पर भेज दी गई है।',
        confirmed: 'बुकिंग की पुष्टि हो गई',
        error: 'क्षमा करें, आपकी बुकिंग सुरक्षित करने में समस्या हुई। कृपया पुनः प्रयास करें।',
        cancelled: 'भुगतान रद्द कर दिया गया। कोई टिकट बुक नहीं किया गया।',
        noted: 'कोई बात नहीं। आपकी बुकिंग रद्द कर दी गई है। मैं आपकी और क्या सहायता कर सकता हूँ?',
        reopen: 'यह सत्र समाप्त हो गया है। नई बुकिंग शुरू करने के लिए, कृपया द्वारपाल को फिर से खोलें।',
        soldOut: 'क्षमा करें, {type} {date} के लिए पूरी तरह से भर गया है। कृपया दूसरी तारीख चुनें।',
        signin: 'अपनी बुकिंग पूरी करने के लिए कृपया Google के साथ साइन इन करें।',
        signinBtn: 'Google के साथ साइन in करें',
        guestName: 'मेहमान #{index} का पूरा नाम क्या है?',
        guestGender: '{name} का लिंग क्या है?',
        guestAge: 'और {name} की उम्र क्या है?',
        genders: ['पुरुष', 'महिला', 'अन्य'],
        ageWarning: '{name} के लिए कृपया एक वैध उम्र (संख्या) दर्ज करें।',
        notEnoughSpots: 'क्षमा करें, इस अनुभव के लिए केवल {available} स्थान शेष हैं। कृपया 1 और {available} के बीच कोई संख्या दर्ज करें।',
        invalidNumber: 'कृपया मेहमानों की संख्या के लिए एक मान्य संख्या दर्ज करें।'
    },
    'German': {
        welcome: 'Willkommen beim Museum Concierge. Wie kann ich Ihnen heute helfen?',
        start: 'Buchung starten',
        langSelect: 'In welcher Sprache möchten Sie fortfahren?',
        experience: 'Welche Art von Erlebnis suchen Sie?',
        options: {},
        date: 'Ausgezeichnete Wahl: {type}. Für welches Datum möchten Sie buchen?',
        guests: 'Wie viele Gäste werden heute bei uns sein?',
        total: 'Gesamt für {qty} Gäste: ₹{total}. Sollen wir zur sicheren Zahlung übergehen?',
        confirmPay: 'Bestätigen & Bezahlen',
        cancel: 'Stornieren',
        signin: 'Bitte melden Sie sich mit Google über die Schaltfläche oben rechts an, um Ihre Buchung abzuschließen.',
        paying: 'Weiterleitung zu unserem sicheren Gateway...',
        success: 'Zahlung erfolgreich! Ihr digitaler goldener Schlüssel wurde an Ihre E-Mail gesendet.',
        confirmed: 'Buchung bestätigt',
        error: 'Entschuldigung, es gab ein Problem bei der Sicherung Ihrer Buchung. Bitte versuchen Sie es erneut.',
        cancelled: 'Zahlung storniert oder abgelehnt. Es wurden keine Tickets gebucht.',
        noted: 'Kein Problem. Ihre Buchung wurde storniert. Wie kann ich Ihnen sonst noch helfen?',
        reopen: 'Diese Sitzung ist beendet. Um eine neue Buchung zu starten, öffnen Sie bitte den Concierge erneut.',
        soldOut: 'Entschuldigung, {type} ist für den {date} ausgebucht. Bitte wählen Sie ein anderes Datum.',
        signin: 'Bitte melden Sie sich mit Google an, um Ihre Buchung abzuschließen.',
        signinBtn: 'Mit Google anmelden',
        guestName: 'Wie lautet der vollständige Name von Gast #{index}?',
        guestGender: 'Welches Geschlecht hat {name}?',
        guestAge: 'Und wie alt ist {name}?',
        genders: ['Männlich', 'Weiblich', 'Anders'],
        ageWarning: 'Bitte geben Sie ein gültiges Alter (Zahl) für {name} an.',
        notEnoughSpots: 'Entschuldigung, es sind nur noch {available} Plätze frei. Bitte geben Sie eine Zahl zwischen 1 und {available} ein.',
        invalidNumber: 'Bitte geben Sie eine gültige Zahl für die Anzahl der Gäste ein.'
    },
    'Italian': {
        welcome: 'Benvenuto al Museum Concierge. Come posso assisterla oggi?',
        start: 'Inizia prenotazione',
        langSelect: 'In quale lingua preferirebbe continuare?',
        experience: 'Che tipo di esperienza sta cercando?',
        options: {},
        date: 'Scelta eccellente: {type}. Per quale data vorrebbe prenotare?',
        guests: 'Quanti ospiti saranno con noi oggi?',
        total: 'Totale per {qty} ospiti: ₹{total}. Procediamo al pagamento sicuro?',
        confirmPay: 'Conferma e Paga',
        cancel: 'Annulla',
        signin: 'Accedi con Google utilizzando il pulsante in alto a destra per completare la prenotazione.',
        paying: 'Procedendo al nostro gateway sicuro...',
        success: 'Pagamento riuscito! La tua chiave d\'oro digitale è stata inviata alla tua email.',
        confirmed: 'Prenotazione confermata',
        error: 'Mi scusi, c\'è stato un problema nel garantire la tua prenotazione. Riprova.',
        cancelled: 'Pagamento annullato o respinto. Nessun biglietto prenotato.',
        noted: 'Nessun problema. La tua prenotazione è stata annullata. Come posso aiutarti ancora?',
        reopen: 'Questa sessione è terminata. Per avviare una nuova prenotazione, riapri il concierge.',
        soldOut: 'Ci scusiamo, {type} è al completo per il {date}. Seleziona un\'altra data.',
        signin: 'Accedi con Google per completare la prenotazione.',
        signinBtn: 'Accedi con Google',
        guestName: 'Qual è il nome completo dell\'ospite #{index}?',
        guestGender: 'Qual è il genere di {name}?',
        guestAge: 'E qual è l\'età di {name}?',
        genders: ['Maschio', 'Femmina', 'Altro'],
        ageWarning: 'Inserisci un\'età valida (numero) per {name}.',
        notEnoughSpots: 'Mi dispiace, sono rimasti solo {available} posti. Inserisci un numero tra 1 e {available}.',
        invalidNumber: 'Inserisci un numero valido per il numero di ospiti.'
    },
    'Japanese': {
        welcome: 'ミュージアムコンシェルジュへようこそ。今日はどのようなご用件でしょうか？',
        start: '予約を開始',
        langSelect: 'どの言語で続行しますか？',
        experience: 'どのような体験をお探しですか？',
        options: {},
        date: '素晴らしい選択です：{type}。どの日付で予約しますか？',
        guests: '本日は何名様でいらっしゃいますか？',
        total: '{qty}名様の合計：₹{total}。安全な支払いに進みますか？',
        confirmPay: '確認して支払う',
        cancel: 'キャンセル',
        signin: '予約を完了するには、右上のボタンを使用してGoogleでサインインしてください。',
        paying: '安全なゲートウェイに進んでいます...',
        success: '支払い成功！デジタルゴールデンキーがメールに送信されました。',
        confirmed: '予約確認済み',
        error: '申し訳ありませんが、予約の確保に問題が発生しました。もう一度お試しください。',
        cancelled: '支払いがキャンセルまたは却下されました。チケットは予約されませんでした。',
        noted: '問題ありません。予約はキャンセルされました。他にお手伝いできることはありますか？',
        reopen: 'このセッションは終了しました。新しい予約を開始するには、コンシェルジュを再度開いてください。',
        soldOut: '申し訳ありませんが、{type}は{date}に満席です。別の日付を選択してください。',
        signin: '予約を完了するには、Googleでサインインしてください。',
        signinBtn: 'Googleでサインイン',
        guestName: 'ゲスト#{index}のフルネームは何ですか？',
        guestGender: '{name}の性別は何ですか？',
        guestAge: 'そして、{name}の年齢は何歳ですか？',
        genders: ['男性', '女性', 'その他'],
        ageWarning: '{name}の有効な年齢（数字）を入力してください。',
        notEnoughSpots: '申し訳ありませんが、残りのスポットは{available}のみです。1から{available}の間の数字を入力してください。',
        invalidNumber: 'ゲスト数の有効な数字を入力してください。'
    }
}


const Chatbot = ({ user }) => {
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            content: TRANSLATIONS['English'].welcome,
            options: [TRANSLATIONS['English'].start]
        }
    ])
    const [step, setStep] = useState('GREETING')
    const [bookingData, setBookingData] = useState({
        language: 'English',
        ticketType: '',
        date: '',
        quantity: 1,
        total: 0,
        guestDetails: []
    })

    const lastBotMessage = [...messages].reverse().find(m => m.type === 'bot')
    let isInputLocked = lastBotMessage && lastBotMessage.options && lastBotMessage.options.length > 0
    if (step === 'QUANTITY') isInputLocked = false
    const [currentGuestIndex, setCurrentGuestIndex] = useState(0)
    const [tempGuest, setTempGuest] = useState({ name: '', gender: '', age: '' })
    const [inputValue, setInputValue] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [ticketTypes, setTicketTypes] = useState([])
    const chatEndRef = useRef(null)

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleRestart = () => {
        setMessages([{
            id: Date.now(),
            type: 'bot',
            content: TRANSLATIONS['English'].welcome,
            options: [TRANSLATIONS['English'].start]
        }])
        setStep('GREETING')
        setBookingData({
            language: 'English',
            ticketType: '',
            date: '',
            quantity: 1,
            total: 0,
            guestDetails: []
        })
        setCurrentGuestIndex(0)
        setTempGuest({ name: '', gender: '', age: '' })
        setInputValue('')
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Close and reset chatbot when user signs in
    const prevUserRef = useRef(user?.uid)
    useEffect(() => {
        if (user?.uid && !prevUserRef.current) {
            setIsOpen(false)
            handleRestart()
        }
        prevUserRef.current = user?.uid
    }, [user])

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/ticket-types`)
                if (res.data.success) {
                    setTicketTypes(res.data.types)
                }
            } catch (err) {
                console.error("Failed to fetch tickets", err)
            }
        }
        fetchTypes()
    }, [])

    const addMessage = (content, type = 'bot', options = []) => {
        setMessages(prev => [...prev, { id: Date.now(), type, content, options }])
    }

    const t = (key, params = {}) => {
        let text = TRANSLATIONS[bookingData.language]?.[key] || TRANSLATIONS['English'][key]
        if (typeof text === 'string') {
            Object.keys(params).forEach(p => {
                text = text.replace(`{${p}}`, params[p])
            })
        }
        return text
    }

    const handleOptionSelect = (option) => {
        addMessage(option, 'user')
        setTimeout(() => {
            processResponse(option, true)
        }, 600)
    }

    const handleSend = () => {
        if (!inputValue.trim()) return
        const userMsg = inputValue.trim()
        addMessage(userMsg, 'user')
        setInputValue('')

        setTimeout(() => {
            processResponse(userMsg)
        }, 600)
    }

    const processResponse = (msg, skipValidation = false) => {
        const lowerMsg = msg.toLowerCase()
        const lang = bookingData.language

        // Validate that user didn't bypass options by typing if skipValidation is NOT set
        const lastBotMessage = [...messages].reverse().find(m => m.type === 'bot')
        const hasOptions = lastBotMessage && lastBotMessage.options && lastBotMessage.options.length > 0

        if (hasOptions && !skipValidation) {
            // Allow typing manual number for quantity step
            if (step !== 'QUANTITY') {
                return;
            }
        }

        if (step === 'GREETING') {
            if (!user) {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    type: 'bot',
                    isComponent: true,
                    content: <div className="signin-prompt">
                        <p>{t('signin')}</p>
                        <button className="chat-signin-btn" onClick={signInWithGoogle}>
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" />
                            <span>{t('signinBtn')}</span>
                        </button>
                    </div>
                }])
                return
            }

            const allLanguages = Object.keys(TRANSLATIONS)
            const initialOptions = [...allLanguages.slice(0, 4), 'More']

            addMessage(t('langSelect'), 'bot', initialOptions)
            setStep('LANGUAGE')
        } else if (step === 'LANGUAGE') {
            if (msg === 'More') {
                const allLanguages = Object.keys(TRANSLATIONS)
                addMessage(t('langSelect'), 'bot', allLanguages)
                return
            }

            let selectedLang = 'English'
            // Handle new languages basics mapping or just direct match
            const exactMatch = Object.keys(TRANSLATIONS).find(key => key.toLowerCase() === lowerMsg)
            if (exactMatch) {
                selectedLang = exactMatch
            } else {
                // Fallback smart matching
                if (lowerMsg.includes('french') || lowerMsg.includes('français')) selectedLang = 'French'
                else if (lowerMsg.includes('spanish') || lowerMsg.includes('español')) selectedLang = 'Spanish'
                else if (lowerMsg.includes('hindi') || lowerMsg.includes('हिंदी')) selectedLang = 'Hindi'
                else if (lowerMsg.includes('german') || lowerMsg.includes('deutsch')) selectedLang = 'German'
                else if (lowerMsg.includes('italian') || lowerMsg.includes('italiano')) selectedLang = 'Italian'
                else if (lowerMsg.includes('japanese') || lowerMsg.includes('日本語')) selectedLang = 'Japanese'
            }

            setBookingData(prev => ({ ...prev, language: selectedLang }))

            // Filter dynamic options to only show those with availability
            const availableTypes = ticketTypes.filter(t => t.available === undefined || t.available > 0)

            if (availableTypes.length > 0) {
                const options = availableTypes.map(t => `${t.name} (₹${t.price})`)
                addMessage(TRANSLATIONS[selectedLang].experience, 'bot', options)
            } else {
                addMessage(t('soldOut', { type: 'All experiences', date: 'today' }), 'bot')
            }
            setStep('TICKET_TYPE')
        } else if (step === 'TICKET_TYPE') {
            let type = 'General Entry'
            let price = 200

            // Strictly find in dynamic types
            const selectedType = ticketTypes.find(t => msg.includes(t.name))
            if (selectedType) {
                type = selectedType.name
                price = selectedType.price
            } else {
                addMessage(t('error'), 'bot')
                return
            }

            setBookingData(prev => ({ ...prev, ticketType: type, total: price }))
            addMessage(t('date', { type }), 'bot', ['DATE_PICKER'])
            setStep('DATE')
        } else if (step === 'DATE') {
            setBookingData(prev => ({ ...prev, date: msg }))

            const fetchAvailability = async () => {
                let available = 0
                try {
                    const res = await axios.get(`${API_BASE_URL}/ticket-types?date=${msg}`)
                    if (res.data.success) {
                        const typeInfo = res.data.types.find(t => t.name === bookingData.ticketType)
                        available = typeInfo ? (typeInfo.available !== undefined ? typeInfo.available : 100) : 0
                    }
                } catch (err) {
                    console.error("Availability check failed", err)
                    available = 0
                }

                if (available <= 0) {
                    addMessage(t('soldOut', { type: bookingData.ticketType, date: msg }), 'bot')
                    // Keep step at DATE correctly or navigate back? 
                    // Since we can't go back easily, let's ask for date again
                    addMessage(t('date', { type: bookingData.ticketType }), 'bot', ['DATE_PICKER'])
                    return
                }

                // Store availability in state for next step validation
                setBookingData(prev => ({ ...prev, availableSpots: available }))

                // Show options up to available (limit to 6 for UI, but allow typing up to available)
                const opts = []
                for (let i = 1; i <= Math.min(6, available); i++) opts.push(i.toString())

                addMessage(t('guests'), 'bot', opts)
                setStep('QUANTITY')
            }
            fetchAvailability()

        } else if (step === 'QUANTITY') {
            const qty = parseInt(msg)
            const available = bookingData.availableSpots || 100 // Default fallback if check failed

            // Use regex to ensure strict positive integer validation
            const isValidNumber = /^[1-9]\d*$/.test(msg);

            if (!isValidNumber || isNaN(qty) || qty <= 0) {
                addMessage(t('invalidNumber'), 'bot')
                return
            }

            if (qty > available) {
                addMessage(t('notEnoughSpots', { available: available }), 'bot')
                return
            }

            const newTotal = bookingData.total * qty
            setBookingData(prev => ({ ...prev, quantity: qty, total: newTotal, guestDetails: [] }))
            setCurrentGuestIndex(0)
            setStep('GUEST_NAME')
            addMessage(t('guestName', { index: 1 }), 'bot')
        } else if (step === 'GUEST_NAME') {
            setTempGuest(prev => ({ ...prev, name: msg }))
            addMessage(t('guestGender', { name: msg }), 'bot', TRANSLATIONS[lang].genders)
            setStep('GUEST_GENDER')
        } else if (step === 'GUEST_GENDER') {
            setTempGuest(prev => ({ ...prev, gender: msg }))
            addMessage(t('guestAge', { name: tempGuest.name }), 'bot')
            setStep('GUEST_AGE')
        } else if (step === 'GUEST_AGE') {
            const age = parseInt(msg)
            if (isNaN(age) || age <= 0 || age > 120) {
                addMessage(t('ageWarning', { name: tempGuest.name }), 'bot')
                return
            }
            const updatedGuest = { ...tempGuest, age: msg }
            const newGuestDetails = [...bookingData.guestDetails, updatedGuest]
            setBookingData(prev => ({ ...prev, guestDetails: newGuestDetails }))

            const nextIndex = currentGuestIndex + 1
            if (nextIndex < bookingData.quantity) {
                setCurrentGuestIndex(nextIndex)
                setTempGuest({ name: '', gender: '', age: '' })
                addMessage(t('guestName', { index: nextIndex + 1 }), 'bot')
                setStep('GUEST_NAME')
            } else {
                addMessage(t('total', { qty: bookingData.quantity, total: bookingData.total }), 'bot', [t('confirmPay'), t('cancel')])
                setStep('PAYMENT_CONFIRM')
            }
        } else if (step === 'PAYMENT_CONFIRM') {
            const isAffirmative = msg === t('confirmPay') || lowerMsg.includes('yes') || lowerMsg.includes('oui') || lowerMsg.includes('sí') || lowerMsg.includes('हाँ')

            if (isAffirmative) {
                addMessage(t('paying'), 'bot')
                setStep('PAYING')
                setIsProcessing(true)

                const finalizeBooking = async () => {
                    try {
                        const orderRes = await axios.post(`${API_BASE_URL}/razorpay/order`, {
                            amount: bookingData.total
                        })

                        if (!orderRes.data.success) throw new Error('Order creation failed')

                        const order = orderRes.data.order

                        const options = {
                            key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
                            amount: order.amount,
                            currency: order.currency,
                            name: "Museum",
                            description: `${bookingData.ticketType} Experience`,
                            order_id: order.id,
                            handler: async (response) => {
                                try {
                                    const bookingPayload = {
                                        bookingId: `LXM-${Math.floor(Math.random() * 100000)}`,
                                        firebaseUid: user?.uid || null,
                                        visitorName: user?.name || 'Anonymous Visitor',
                                        ticketType: bookingData.ticketType,
                                        date: bookingData.date,
                                        quantity: bookingData.quantity,
                                        totalAmount: bookingData.total,
                                        guestDetails: bookingData.guestDetails,
                                        language: bookingData.language,
                                        razorpayOrderId: response.razorpay_order_id,
                                        paymentId: response.razorpay_payment_id
                                    }

                                    await axios.post(`${API_BASE_URL}/bookings`, bookingPayload)

                                    addMessage(t('success'), 'bot')
                                    setMessages(prev => [...prev, {
                                        id: Date.now(),
                                        type: 'bot',
                                        isComponent: true,
                                        content: <div className="ticket-success">
                                            <CheckCircle color="#DAA520" size={48} />
                                            <h4>{t('confirmed')}</h4>
                                            <p>ID: #{bookingPayload.bookingId}</p>
                                        </div>
                                    }])
                                    setStep('FINISHED')

                                    // Auto-close sequence
                                    setTimeout(() => {
                                        addMessage(t('reopen'), 'bot')
                                        setTimeout(() => {
                                            setIsOpen(false)
                                            navigate('/history?new_booking=true')

                                            // Reset for next session after a short delay (once closed)
                                            setTimeout(() => {
                                                setMessages([
                                                    { id: 1, type: 'bot', content: TRANSLATIONS[bookingData.language].welcome, options: [TRANSLATIONS[bookingData.language].start] }
                                                ])
                                                setStep('GREETING')
                                            }, 500)
                                        }, 4000)
                                    }, 2000)

                                } catch (err) {
                                    addMessage(t('error'), 'bot')
                                } finally {
                                    setIsProcessing(false)
                                }
                            },
                            prefill: {
                                name: user?.name,
                                email: user?.email
                            },
                            theme: {
                                color: "#DAA520"
                            },
                            modal: {
                                ondismiss: () => {
                                    setIsProcessing(false)
                                    addMessage(t('cancelled'), 'bot')
                                    setStep('GREETING')

                                    // Auto-close on dismiss
                                    setTimeout(() => {
                                        addMessage(t('reopen'), 'bot')
                                        setTimeout(() => {
                                            setIsOpen(false)
                                            setTimeout(() => {
                                                setMessages([{ id: 1, type: 'bot', content: TRANSLATIONS[bookingData.language].welcome, options: [TRANSLATIONS[bookingData.language].start] }])
                                            }, 500)
                                        }, 3000)
                                    }, 1500)
                                }
                            }
                        }

                        const rzp = new window.Razorpay(options)
                        rzp.open()

                    } catch (err) {
                        console.error(err)
                        addMessage(t('error'), 'bot')
                        setStep('GREETING')
                        setIsProcessing(false)
                    }
                }

                setTimeout(finalizeBooking, 2000)
            } else {
                addMessage(t('noted'))
                setStep('GREETING')

                // Auto-close on manual cancel
                setTimeout(() => {
                    addMessage(t('reopen'), 'bot')
                    setTimeout(() => {
                        setIsOpen(false)
                        setTimeout(() => {
                            setMessages([{
                                id: 1,
                                type: 'bot',
                                content: TRANSLATIONS[bookingData.language].welcome,
                                options: [TRANSLATIONS[bookingData.language].start]
                            }])
                        }, 500)
                    }, 3000)
                }, 1500)
            }
        }
    }

    return (
        <>
            <div
                id="chat-toggle"
                className={`chat-toggle ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 20 }}
                        className="chat-reset-fab"
                        onClick={handleRestart}
                        title="Restart Chat"
                    >
                        <RotateCcw size={20} />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="chat-window "
                    >
                        <div className="chat-header">
                            <div className="header-info">
                                <Bot size={24} color="var(--primary)" />
                                <div>
                                    <h4>Museum Concierge</h4>
                                    <p>Online | Premium Assistant</p>
                                </div>
                            </div>
                        </div>

                        <div className="chat-messages">
                            {messages.map((m, index) => {
                                const isLast = index === messages.length - 1;
                                return (
                                    <div key={m.id} className="message-group">
                                        <div className={`message-wrapper ${m.type}`}>
                                            <div className="message-icon">
                                                {m.type === 'bot' ? <Bot size={16} /> : <User size={16} />}
                                            </div>
                                            <div className="message-bubble">
                                                {m.isComponent ? m.content : m.content.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                                            </div>
                                        </div>
                                        {m.options && m.options.length > 0 && m.type === 'bot' && (
                                            <div className="options-container">
                                                {m.options[0] === 'DATE_PICKER' ? (
                                                    <div className="date-input-wrapper">
                                                        <input
                                                            type="date"
                                                            className="chat-date-input"
                                                            onChange={(e) => handleOptionSelect(e.target.value)}
                                                            min={new Date().toISOString().split('T')[0]}
                                                            disabled={!isLast}
                                                        />
                                                    </div>
                                                ) : (
                                                    m.options.map((opt, idx) => (
                                                        <button
                                                            key={idx}
                                                            className="option-btn"
                                                            onClick={() => handleOptionSelect(opt)}
                                                            disabled={!isLast}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                            {isProcessing && (
                                <div className="message-wrapper bot">
                                    <div className="message-icon"><Bot size={16} /></div>
                                    <div className="message-bubble">
                                        <Loader2 className="animate-spin" size={20} />
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="chat-input-area">
                            <input
                                type="text"
                                placeholder={isInputLocked ? "Select an option above..." : "Type your message..."}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !isInputLocked && handleSend()}
                                disabled={isInputLocked || isProcessing}
                            />
                            <button onClick={handleSend} disabled={!inputValue.trim() || isProcessing || isInputLocked}>
                                <Send size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
        .chat-toggle {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2000;
          box-shadow: 0 10px 30px rgba(218, 165, 32, 0.4);
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .chat-toggle.active {
          background: var(--bg-card);
          transform: rotate(90deg);
        }
        .chat-window {
          position: fixed;
          bottom: 100px;
          right: 30px;
          width: 400px;
          height: 600px;
          max-height: calc(100vh - 120px);
          display: flex;
          flex-direction: column;
          z-index: 1999;
          overflow: hidden;
          box-shadow: var(--shadow);
          background: #121417;
          border: 1px solid var(--glass-border);
          border-radius: 20px;
        }
        .chat-header {
          padding: 20px;
          border-bottom: 1px solid var(--glass-border);
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .chat-reset-fab {
          position: fixed;
          bottom: 100px;
          right: 35px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(40, 44, 52, 0.9);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2005; /* Higher than chat window */
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
          transition: 0.3s;
        }
        .chat-reset-fab:hover {
          background: var(--primary);
          color: white;
          transform: rotate(-180deg);
        }
        .header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .header-info h4 {
          font-weight: 600;
          margin: 0;
        }
        .header-info p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin: 0;
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .message-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .message-wrapper {
          display: flex;
          gap: 12px;
          max-width: 85%;
        }
        .message-wrapper.user {
          flex-direction: row-reverse;
          align-self: flex-end;
        }
        .message-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--glass);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .user .message-icon {
            background: var(--primary);
        }
        .message-bubble {
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        .bot .message-bubble {
          background: rgba(255, 255, 255, 0.08);
          border-bottom-left-radius: 4px;
          color: #e0e0e0;
        }
        .user .message-bubble {
          background: var(--primary);
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .options-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            padding-left: 44px;
        }
        .option-btn {
            background: rgba(218, 165, 32, 0.1);
            color: var(--primary);
            border: 1px solid rgba(218, 165, 32, 0.3);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: 0.3s;
        }
        .option-btn:hover {
            background: var(--primary);
            color: white;
        }
        
        .date-input-wrapper {
            padding-left: 44px;
        }
        .chat-date-input {
            background: rgba(255,255,255,0.05);
            border: 1px solid var(--glass-border);
            color: white;
            padding: 8px 12px;
            border-radius: 10px;
            outline: none;
            cursor: pointer;
        }
        .chat-date-input:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
        }
        .option-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: transparent;
            border-color: rgba(255,255,255,0.1);
            color: var(--text-secondary);
            pointer-events: none;
        }

        .chat-input-area {
          padding: 20px;
          border-top: 1px solid var(--glass-border);
          display: flex;
          gap: 10px;
        }
        .chat-input-area input {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          padding: 12px 16px;
          border-radius: 12px;
          color: white;
          outline: none;
          transition: 0.3s;
        }
        .chat-input-area input:disabled {
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 255, 255, 0.05);
          cursor: not-allowed;
          opacity: 0.6;
        }
        .chat-input-area button {
          background: var(--primary);
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
        }
        .chat-input-area button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .ticket-success {
            text-align: center;
            padding: 20px;
            background: rgba(218, 165, 32, 0.05);
            border-radius: 15px;
            border: 1px solid rgba(218, 165, 32, 0.2);
        }
        .ticket-success h4 {
            margin: 15px 0 5px;
            color: var(--primary);
            letter-spacing: 1px;
        }
        .ticket-success p {
            font-size: 0.85rem;
            opacity: 0.8;
        }
        .animate-spin {
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .signin-prompt {
            display: flex;
            flex-direction: column;
            gap: 15px;
            align-items: center;
            text-align: center;
            padding: 10px 0;
        }
        .chat-signin-btn {
            background: white;
            color: #333;
            padding: 10px 20px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 700;
            font-size: 0.95rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .chat-signin-btn img {
            width: 20px;
        }
        .chat-signin-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(0,0,0,0.15);
        }

        @media (max-width: 480px) {
          .chat-window {
            width: 100%;
            height: 100%;
            right: 0;
            bottom: 0;
            border-radius: 0;
          }
          .chat-toggle {
            display: none;
          }
          .chat-toggle.active {
            display: flex;
            top: 20px;
            right: 20px;
            bottom: auto;
            width: 40px;
            height: 40px;
            background: rgba(0,0,0,0.5);
          }
        }
      `}} />
        </>
    )
}

export default Chatbot
