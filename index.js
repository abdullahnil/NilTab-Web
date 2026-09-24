/* NilTab Premium Frontend Logic */

let appSettings = {};
let calendarEvents = [];
let localPort = window.location.port;
let lastWeatherData = null;
let clockIntervalId = null;
let weatherIntervalId = null;
let lastWeatherFetchTime = 0;
const WEATHER_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 dakika (5 minutes)

// --- i18n Translation Dictionary ---
const i18n = {
    tr: {
        weather: "HAVA DURUMU",
        prayer: "NAMAZ VAKİTLERİ",
        shortcuts: "KISAYOLLAR",
        quote: "Günün Ayeti / Hadisi",
        calendar: "Takvim & Etkinlikler",
        upcoming: "Yaklaşanlar",
        focus_btn: "Odak Modu",
        board_btn: "Tahta Modu",
        voice_btn: "AI Asistan",
        settings_btn: "Ayarlar",
        exit_btn: "Çıkış",
        focus_exit_info: "Çıkmak için çift tıklayın",
        listening: "Dinleniyor...",
        speak_info: "Konuşmak için mikrofona dokunun.",
        whats_next: "Sonraki vakit...",
        no_prayer: "Vakitler alınamadı.",
        remaining: "kaldı",
        until: "vaktine",
        countdown_template: "{name} vaktine {time} kaldı",
        clear_confirm: "Çizimi temizlemek istediğinize emin misiniz?",
        drawing_saved: "Çizim kaydedildi",
        drawing_downloaded: "Çizim indirildi!",
        local_app_warning: "Yerel uygulamaları çalıştırmak yalnızca masaüstü sürümünde desteklenir.",
        field_required: "İsim ve Yol/URL alanları boş bırakılamaz.",
        cal_field_required: "Başlık ve Başlangıç zamanı alanları zorunludur.",
        ics_imported: "etkinlik içe aktarıldı!",
        no_ics_events: "Geçerli bir takvim etkinliği bulunamadı.",
        no_events: "Yakın zamanda etkinlik bulunmuyor.",
        hours: "sa",
        minutes: "dk",
        seconds: "sn",
        settings_title: "Ayarlar",
        tab_general: "Genel",
        tab_widgets: "Bileşenler",
        tab_shortcuts: "Kısayollar",
        tab_calendar: "Takvim",
        tab_ai: "Yapay Zeka",
        lbl_language: "Dil / Language",
        lbl_mode: "Ekran Koruyucu Çıkış Modu",
        lbl_mode_scr: "Klasik (Fare oynayınca veya tıklayınca kapanır)",
        lbl_mode_int: "Etkileşimli (Çıkış için Esc tuşuna basın)",
        lbl_focus_clock: "Odak modunda saat gösterilsin mi?",
        lbl_bg_type: "Arkaplan Türü",
        lbl_bg_type_video: "Video",
        lbl_bg_type_image: "Görsel",
        lbl_bg_type_grad: "Dinamik Renk Geçişi (Varsayılan)",
        lbl_bg_path: "Arkaplan Dosyası Seç",
        lbl_bg_select: "Dosya Seç",
        lbl_bg_blur: "Arkaplan Bulanıklığı",
        lbl_bg_brightness: "Arkaplan Parlaklığı",
        lbl_bg_presets: "Hazır Arkaplanlar",
        tab_weather_heading: "Hava Durumu Ayarları",
        lbl_weather_show: "Hava durumu widget'ını göster",
        lbl_weather_city: "Şehir İsmi",
        lbl_weather_search: "Ara ve Kaydet",
        tab_prayer_heading: "Namaz Vakitleri Ayarları",
        lbl_prayer_show: "Namaz vakti widget'ını göster",
        lbl_prayer_source: "Veri Kaynağı",
        lbl_prayer_src_diyanet: "Resmi Diyanet API (Türkiye için önerilir)",
        lbl_prayer_src_aladhan: "Aladhan API (Yurtdışı için önerilir)",
        lbl_diyanet_loc: "📍 Diyanet Konum Seçimi",
        lbl_country: "Ülke",
        lbl_state: "İl / Bölge",
        lbl_city: "İlçe / Şehir",
        lbl_aladhan_method: "⚙️ Aladhan Metod Seçimi",
        lbl_prayer_method: "Hesaplama Metodu",
        lbl_aladhan_warning: "⚠️ Uyarı: Bu yöntem matematiksel hesaplama kullanır, resmi Diyanet takvimiyle ufak sapmalar (1-2 dakika) gösterebilir.",
        lbl_tbl_icon: "İkon",
        lbl_tbl_name: "İsim",
        lbl_tbl_path: "Yol / URL",
        lbl_tbl_action: "İşlem",
        lbl_add_shortcut_btn: "+ Yeni Kısayol Ekle",
        lbl_shortcut_diag_title: "Kısayol Ekle",
        lbl_shortcut_diag_name: "Kısayol İsmi",
        lbl_shortcut_diag_path: "Uygulama Yolu veya Web Linki",
        lbl_shortcut_diag_icon: "Emoji İkonu",
        lbl_event_diag_title: "Etkinlik Ekle",
        lbl_event_diag_summary: "Etkinlik Başlığı",
        lbl_event_diag_start: "Başlangıç Zamanı",
        lbl_event_diag_end: "Bitiş Zamanı",
        lbl_cal_sync: "Etkinlik Senkronizasyonu (.ics)",
        lbl_cal_help: "Yerel (.ics) dosya yollarını veya Google Calendar vb. özel URL'lerini ekleyebilirsiniz.",
        lbl_cal_add_source: "+ Takvim Kaynağı Ekle",
        lbl_cal_upload: "ICS Dosyası Yükle",
        lbl_cal_gcal_title: "Google Takvim Nasıl Eklenir?",
        lbl_cal_gcal_step1: "1. Google Takvim'i açın, sol menüde takviminizin yanındaki üç noktaya basıp \"Ayarlar ve Paylaşım\" seçeneğine gidin.",
        lbl_cal_gcal_step2: "2. Sayfanın en altına kaydırın ve \"iCal biçimindeki gizli adres\" yazan kısmın yanındaki URL'yi kopyalayın.",
        lbl_cal_gcal_step3: "3. Kopyaladığınız URL'yi yukarıdaki \"Takvim Kaynağı\" kutularından birine yapıştırın.",
        lbl_ai_key_title: "Gemini API Anahtarı (API Key)",
        lbl_ai_key_placeholder: "AI cevapları için Gemini API Key girin",
        lbl_ai_key_desc: "API anahtarı girildiğinde asistanınız genel sorulara Gemini üzerinden cevap verebilir. Anahtar girilmezse yalnızca yerel komutları çalıştırır.",
        btn_save: "Ayarları Kaydet",
        btn_cancel: "İptal",
        lbl_add_btn: "Ekle",
        lbl_tb_back: "Geri",
        lbl_tb_brush: "Boyut",
        lbl_tb_text: "Metin",
        lbl_tb_eraser: "Silgi",
        lbl_tb_undo: "Geri Al",
        lbl_tb_clear: "Temizle",
        lbl_tb_save: "Kaydet",
        lbl_weather_forecast: "Detaylı Hava Durumu",
        lbl_hourly: "Saatlik Tahmin (Bugün)",
        lbl_daily: "Günlük Tahmin (7 Gün)",
        lbl_change_loc: "Konumu Değiştir",
        lbl_gps_auto: "Konumumu Bul",
        lbl_today: "Bugün",
        search_google: "Google ile ara...",
        search_startpage: "StartPage ile ara...",
        search_duckduckgo: "DuckDuckGo ile ara...",
        imsak: "İmsak",
        gunes: "Güneş",
        ogle: "Öğle",
        ikindi: "İkindi",
        aksam: "Akşam",
        yatsi: "Yatsı",
        fullscreen_btn: "Tam Ekran",
        desktop_promo: "nilTab Desktop'ı deneyin",
        quote_verse: "Günün Ayeti",
        quote_hadith: "Günün Hadisi",
        media_no_playback: "Müzik Oynatılmıyor",
        media_waiting: "Medya bekleniyor",
        media_title: "Müzik Oynatıcı",
        media_artist: "Medya kontrolleri aktif",
        gps_searching: "GPS aranıyor...",
        gps_not_supported: "GPS desteklenmiyor.",
        gps_resolving: "Adres çözülüyor...",
        gps_located: "Bulundu",
        gps_denied: "Konum izni reddedildi",
        gps_coord_saved: "Koordinat ile kaydedildi.",
        city_search_searching: "Aranıyor...",
        city_search_not_found: "Şehir bulunamadı.",
        city_search_saved: "Konum güncellendi.",
        file_save_error: "Dosya kaydedilirken hata oluştu.",
        lbl_about_privacy_title: "Hakkında & Gizlilik",
        lbl_about_privacy_text: "NilTab tamamen yerel odaklı çalışır. Konumunuz ve takvim verileriniz cihazınızda işlenir ve hiçbir üçüncü taraf sunucuyla paylaşılmaz. AI Sesli Asistan tarayıcınızın yerel ses tanıma sistemini kullanır."
    },
    en: {
        weather: "WEATHER",
        prayer: "PRAYER TIMES",
        shortcuts: "SHORTCUTS",
        quote: "Verse / Hadith of the Day",
        calendar: "Calendar & Events",
        upcoming: "Upcoming",
        focus_btn: "Focus Mode",
        board_btn: "Whiteboard",
        voice_btn: "AI Assistant",
        settings_btn: "Settings",
        exit_btn: "Exit",
        focus_exit_info: "Double click to exit",
        listening: "Listening...",
        speak_info: "Tap microphone to speak.",
        whats_next: "Next prayer...",
        no_prayer: "Prayer times unavailable.",
        remaining: "remaining",
        until: "until",
        countdown_template: "{time} remaining until {name}",
        clear_confirm: "Are you sure you want to clear the drawing?",
        drawing_saved: "Drawing saved",
        drawing_downloaded: "Drawing downloaded!",
        local_app_warning: "Launching local applications is only supported in the desktop version.",
        field_required: "Name and Path/URL fields cannot be empty.",
        cal_field_required: "Summary and Start time fields are required.",
        ics_imported: "events imported!",
        no_ics_events: "No valid calendar events found.",
        no_events: "No upcoming events.",
        hours: "h",
        minutes: "m",
        seconds: "s",
        settings_title: "Settings",
        tab_general: "General",
        tab_widgets: "Widgets",
        tab_shortcuts: "Shortcuts",
        tab_calendar: "Calendar",
        tab_ai: "AI",
        lbl_language: "Language / Dil",
        lbl_mode: "Screensaver Exit Mode",
        lbl_mode_scr: "Traditional (Closes on mouse move or click)",
        lbl_mode_int: "Interactive (Press Esc to exit)",
        lbl_focus_clock: "Show clock in focus mode?",
        lbl_bg_type: "Background Type",
        lbl_bg_type_video: "Video",
        lbl_bg_type_image: "Image",
        lbl_bg_type_grad: "Dynamic Gradient (Default)",
        lbl_bg_path: "Select Background File",
        lbl_bg_select: "Select File",
        lbl_bg_blur: "Background Blur",
        lbl_bg_brightness: "Background Brightness",
        lbl_bg_presets: "Preset Backgrounds",
        tab_weather_heading: "Weather Settings",
        lbl_weather_show: "Show weather widget",
        lbl_weather_city: "City Name",
        lbl_weather_search: "Search & Save",
        tab_prayer_heading: "Prayer Times Settings",
        lbl_prayer_show: "Show prayer times widget",
        lbl_prayer_source: "Data Source",
        lbl_prayer_src_diyanet: "Official Diyanet API (Recommended for Turkey)",
        lbl_prayer_src_aladhan: "Aladhan API (Recommended worldwide)",
        lbl_diyanet_loc: "📍 Diyanet Location Selection",
        lbl_country: "Country",
        lbl_state: "State / Region",
        lbl_city: "City / District",
        lbl_aladhan_method: "⚙️ Aladhan Method Selection",
        lbl_prayer_method: "Calculation Method",
        lbl_aladhan_warning: "⚠️ Note: This method uses mathematical calculations; minor deviations (1-2 minutes) from official local calendars may occur.",
        lbl_tbl_icon: "Icon",
        lbl_tbl_name: "Name",
        lbl_tbl_path: "Path / URL",
        lbl_tbl_action: "Action",
        lbl_add_shortcut_btn: "+ Add New Shortcut",
        lbl_shortcut_diag_title: "Add Shortcut",
        lbl_shortcut_diag_name: "Shortcut Name",
        lbl_shortcut_diag_path: "Application Path or Web Link",
        lbl_shortcut_diag_icon: "Emoji Icon",
        lbl_event_diag_title: "Add Event",
        lbl_event_diag_summary: "Event Title",
        lbl_event_diag_start: "Start Time",
        lbl_event_diag_end: "End Time",
        lbl_cal_sync: "Event Synchronization (.ics)",
        lbl_cal_help: "You can add local (.ics) file paths or Google Calendar private iCal URLs.",
        lbl_cal_add_source: "+ Add Calendar Source",
        lbl_cal_upload: "Upload ICS File",
        lbl_cal_gcal_title: "How to Add Google Calendar?",
        lbl_cal_gcal_step1: "1. Open Google Calendar, click the three dots next to your calendar in the left menu, and choose 'Settings and sharing'.",
        lbl_cal_gcal_step2: "2. Scroll to the bottom of the page and copy the URL next to 'Secret address in iCal format'.",
        lbl_cal_gcal_step3: "3. Paste the copied URL into one of the 'Calendar Source' input boxes above.",
        lbl_ai_key_title: "Gemini API Key",
        lbl_ai_key_placeholder: "Enter Gemini API Key for AI responses",
        lbl_ai_key_desc: "When the API key is entered, your assistant can answer general questions via Gemini. If no key is entered, it only executes local commands.",
        btn_save: "Save Settings",
        btn_cancel: "Cancel",
        lbl_add_btn: "Add",
        lbl_tb_back: "Back",
        lbl_tb_brush: "Size",
        lbl_tb_text: "Text",
        lbl_tb_eraser: "Eraser",
        lbl_tb_undo: "Undo",
        lbl_tb_clear: "Clear",
        lbl_tb_save: "Save",
        lbl_weather_forecast: "Detailed Weather",
        lbl_hourly: "Hourly Forecast (Today)",
        lbl_daily: "Daily Forecast (7 Days)",
        lbl_change_loc: "Change Location",
        lbl_gps_auto: "Find My Location",
        lbl_today: "Today",
        search_google: "Search with Google...",
        search_startpage: "Search with StartPage...",
        search_duckduckgo: "Search with DuckDuckGo...",
        imsak: "Fajr",
        gunes: "Sunrise",
        ogle: "Dhuhr",
        ikindi: "Asr",
        aksam: "Maghrib",
        yatsi: "Isha",
        fullscreen_btn: "Fullscreen",
        desktop_promo: "Try nilTab Desktop",
        quote_verse: "Verse of the Day",
        quote_hadith: "Hadith of the Day",
        media_no_playback: "No Playback",
        media_waiting: "Waiting for media",
        media_title: "Music Player",
        media_artist: "Media controls active",
        gps_searching: "Accessing GPS...",
        gps_not_supported: "GPS not supported.",
        gps_resolving: "Resolving address...",
        gps_located: "Located",
        gps_denied: "Location permission denied",
        gps_coord_saved: "Saved via coordinates.",
        city_search_searching: "Searching...",
        city_search_not_found: "City not found.",
        city_search_saved: "Location updated.",
        file_save_error: "Error occurred while saving file.",
        lbl_about_privacy_title: "About & Privacy",
        lbl_about_privacy_text: "NilTab is local-first. Your location, settings, and calendar data are processed locally on your device and never shared with third-party servers. The AI Voice Assistant utilizes your browser's native speech recognition."
    },
    de: {
        weather: "WETTER",
        prayer: "GEBETSZEITEN",
        shortcuts: "VERKNÜPFUNGEN",
        quote: "Vers / Hadith des Tages",
        calendar: "Kalender & Ereignisse",
        upcoming: "Kommende",
        focus_btn: "Fokusmodus",
        board_btn: "Whiteboard",
        voice_btn: "KI-Assistent",
        settings_btn: "Einstellungen",
        exit_btn: "Beenden",
        focus_exit_info: "Doppelklicken zum Beenden",
        listening: "Ich höre zu...",
        speak_info: "Tippen Sie auf das Mikrofon, um zu sprechen.",
        whats_next: "Nächstes Gebet...",
        no_prayer: "Gebetszeiten nicht verfügbar.",
        remaining: "verbleibend",
        until: "bis",
        countdown_template: "{time} verbleibend bis {name}",
        clear_confirm: "Sind Sie sicher, dass Sie die Zeichnung löschen möchten?",
        drawing_saved: "Zeichnung gespeichert",
        drawing_downloaded: "Zeichnung heruntergeladen!",
        local_app_warning: "Das Starten lokaler Anwendungen wird nur in der Desktop-Version unterstützt.",
        field_required: "Name und Pfad/URL-Felder dürfen nicht leer sein.",
        cal_field_required: "Zusammenfassung und Startzeit sind erforderlich.",
        ics_imported: "Ereignisse importiert!",
        no_ics_events: "Keine gültigen Kalenderereignisse gefunden.",
        no_events: "Keine anstehenden Ereignisse.",
        hours: "Std.",
        minutes: "Min.",
        seconds: "Sek.",
        settings_title: "Einstellungen",
        tab_general: "Allgemein",
        tab_widgets: "Widgets",
        tab_shortcuts: "Verknüpfungen",
        tab_calendar: "Kalender",
        tab_ai: "KI",
        lbl_language: "Sprache",
        lbl_mode: "Bildschirmschoner-Modus",
        lbl_mode_scr: "Klassisch (Schließt bei Mausbewegung oder Klick)",
        lbl_mode_int: "Interaktiv (Drücken Sie Esc zum Beenden)",
        lbl_focus_clock: "Uhr im Fokusmodus anzeigen?",
        lbl_bg_type: "Hintergrundtyp",
        lbl_bg_type_video: "Video",
        lbl_bg_type_image: "Bild",
        lbl_bg_type_grad: "Dynamischer Farbverlauf (Standard)",
        lbl_bg_path: "Hintergrunddatei auswählen",
        lbl_bg_select: "Datei auswählen",
        lbl_bg_blur: "Hintergrundunschärfe",
        lbl_bg_brightness: "Hintergrundhelligkeit",
        lbl_bg_presets: "Voreingestellte Hintergründe",
        tab_weather_heading: "Wettereinstellungen",
        lbl_weather_show: "Wetter-Widget anzeigen",
        lbl_weather_city: "Stadtname",
        lbl_weather_search: "Suchen & Speichern",
        tab_prayer_heading: "Gebetszeiten-Einstellungen",
        lbl_prayer_show: "Gebetszeiten-Widget anzeigen",
        lbl_prayer_source: "Datenquelle",
        lbl_prayer_src_diyanet: "Offizielle Diyanet-API (Empfohlen für die Türkei)",
        lbl_prayer_src_aladhan: "Aladhan-API (Weltweit empfohlen)",
        lbl_diyanet_loc: "📍 Diyanet Standortauswahl",
        lbl_country: "Land",
        lbl_state: "Bundesland / Region",
        lbl_city: "Bezirk / Stadt",
        lbl_aladhan_method: "⚙️ Aladhan Berechnungsmethode",
        lbl_prayer_method: "Berechnungsmethode",
        lbl_aladhan_warning: "⚠️ Hinweis: Diese Methode verwendet mathematische Berechnungen; es können geringfügige Abweichungen (1-2 Minuten) von lokalen offiziellen Kalendern auftreten.",
        lbl_tbl_icon: "Symbol",
        lbl_tbl_name: "Name",
        lbl_tbl_path: "Pfad / URL",
        lbl_tbl_action: "Aktion",
        lbl_add_shortcut_btn: "+ Neue Verknüpfung hinzufügen",
        lbl_shortcut_diag_title: "Verknüpfung hinzufügen",
        lbl_shortcut_diag_name: "Name der Verknüpfung",
        lbl_shortcut_diag_path: "Anwendungspfad oder Weblink",
        lbl_shortcut_diag_icon: "Emoji-Symbol",
        lbl_event_diag_title: "Ereignis hinzufügen",
        lbl_event_diag_summary: "Ereignistitel",
        lbl_event_diag_start: "Startzeit",
        lbl_event_diag_end: "Endzeit",
        lbl_cal_sync: "Ereignissynchronisation (.ics)",
        lbl_cal_help: "Sie können lokale (.ics) Pfade oder private Google Kalender iCal-URLs hinzufügen.",
        lbl_cal_add_source: "+ Kalenderquelle hinzufügen",
        lbl_cal_upload: "ICS-Datei hochladen",
        lbl_cal_gcal_title: "Wie füge ich Google Kalender hinzu?",
        lbl_cal_gcal_step1: "1. Öffnen Sie Google Kalender, klicken Sie neben Ihrem Kalender im linken Menü auf die drei Punkte und wählen Sie 'Einstellungen und Freigabe'.",
        lbl_cal_gcal_step2: "2. Scrollen Sie nach unten und kopieren Sie die URL unter 'Privatadresse im iCal-Format'.",
        lbl_cal_gcal_step3: "3. Fügen Sie die kopierte URL in eines der Eingabefelder oben ein.",
        lbl_ai_key_title: "Gemini API-Schlüssel",
        lbl_ai_key_placeholder: "Geben Sie den Gemini API-Schlüssel für KI-Antworten ein",
        lbl_ai_key_desc: "Wenn der API-Schlüssel eingegeben wird, kann Ihr Assistent allgemeine Fragen über Gemini beantworten. Wenn kein Schlüssel eingegeben wird, führt er nur lokale Befehle aus.",
        btn_save: "Einstellungen speichern",
        btn_cancel: "Abbrechen",
        lbl_add_btn: "Hinzufügen",
        lbl_tb_back: "Zurück",
        lbl_tb_brush: "Größe",
        lbl_tb_text: "Text",
        lbl_tb_eraser: "Radiergummi",
        lbl_tb_undo: "Rückgängig",
        lbl_tb_clear: "Löschen",
        lbl_tb_save: "Speichern",
        lbl_weather_forecast: "Detailliertes Wetter",
        lbl_hourly: "Stündliche Vorhersage (Heute)",
        lbl_daily: "Tägliche Vorhersage (7 Tage)",
        lbl_change_loc: "Standort ändern",
        lbl_gps_auto: "Meinen Standort finden",
        lbl_today: "Heute",
        search_google: "Mit Google suchen...",
        search_startpage: "Mit StartPage suchen...",
        search_duckduckgo: "Mit DuckDuckGo suchen...",
        imsak: "Fajr",
        gunes: "Sonnenaufgang",
        ogle: "Dhuhr",
        ikindi: "Asr",
        aksam: "Maghrib",
        yatsi: "Isha",
        fullscreen_btn: "Vollbild",
        desktop_promo: "nilTab Desktop ausprobieren",
        quote_verse: "Vers des Tages",
        quote_hadith: "Hadith des Tages",
        media_no_playback: "Keine Wiedergabe",
        media_waiting: "Warten auf Medien",
        media_title: "Musikplayer",
        media_artist: "Mediensteuerung aktiv",
        gps_searching: "GPS wird gesucht...",
        gps_not_supported: "GPS wird nicht unterstützt.",
        gps_resolving: "Adresse wird aufgelöst...",
        gps_located: "Gefunden",
        gps_denied: "Standortberechtigung verweigert",
        gps_coord_saved: "Mit Koordinaten gespeichert.",
        city_search_searching: "Wird gesucht...",
        city_search_not_found: "Stadt nicht gefunden.",
        city_search_saved: "Standort aktualisiert.",
        file_save_error: "Beim Speichern der Datei ist ein Fehler aufgetreten.",
        lbl_about_privacy_title: "Über & Datenschutz",
        lbl_about_privacy_text: "NilTab arbeitet lokal. Ihre Standort-, Einstellungs- und Kalenderdaten werden lokal auf Ihrem Gerät verarbeitet und niemals an Dritte weitergegeben. Der KI-Sprachassistent nutzt die native Spracherkennung Ihres Browsers."
    },
    ru: {
        weather: "ПОГОДА",
        prayer: "ВРЕМЯ НАМАЗА",
        shortcuts: "ЯРЛЫКИ",
        quote: "Аят / Хадис дня",
        calendar: "Календарь и События",
        upcoming: "Предстоящие",
        focus_btn: "Режим фокусировки",
        board_btn: "Доска",
        voice_btn: "ИИ Ассистент",
        settings_btn: "Настройки",
        exit_btn: "Выход",
        focus_exit_info: "Дважды кликните для выхода",
        listening: "Слушаю...",
        speak_info: "Нажмите на микрофон, чтобы говорить.",
        whats_next: "Следующий намаз...",
        no_prayer: "Время намаза недоступно.",
        remaining: "осталось",
        until: "до",
        countdown_template: "До {name} осталось {time}",
        clear_confirm: "Вы уверены, что хотите очистить рисунок?",
        drawing_saved: "Рисунок сохранен",
        drawing_downloaded: "Рисунок скачан!",
        local_app_warning: "Запуск локальных приложений поддерживается только в версии для рабочего стола.",
        field_required: "Поля Имя и Путь/URL не могут быть пустыми.",
        cal_field_required: "Поля Заголовок и Время начала обязательны.",
        ics_imported: "событий импортировано!",
        no_ics_events: "Действующие события календаря не найдены.",
        no_events: "Нет предстоящих событий.",
        hours: "ч",
        minutes: "мин",
        seconds: "сек",
        settings_title: "Настройки",
        tab_general: "Общие",
        tab_widgets: "Виджеты",
        tab_shortcuts: "Ярлыки",
        tab_calendar: "Календарь",
        tab_ai: "ИИ",
        lbl_language: "Язык",
        lbl_mode: "Режим выхода из хранителя экрана",
        lbl_mode_scr: "Классический (закрывается при движении мыши)",
        lbl_mode_int: "Интерактивный (Нажмите Esc для выхода)",
        lbl_focus_clock: "Показывать часы в режиме фокусировки?",
        lbl_bg_type: "Тип фона",
        lbl_bg_type_video: "Видео",
        lbl_bg_type_image: "Изображение",
        lbl_bg_type_grad: "Динамический градиент (По умолчанию)",
        lbl_bg_path: "Выбрать файл фона",
        lbl_bg_select: "Выбрать файл",
        lbl_bg_blur: "Размытие фона",
        lbl_bg_brightness: "Яркость фона",
        lbl_bg_presets: "Готовые фоны",
        tab_weather_heading: "Настройки погоды",
        lbl_weather_show: "Показывать виджет погоды",
        lbl_weather_city: "Название города",
        lbl_weather_search: "Найти и Сохранить",
        tab_prayer_heading: "Настройки времени намаза",
        lbl_prayer_show: "Показывать виджет времени намаза",
        lbl_prayer_source: "Источник данных",
        lbl_prayer_src_diyanet: "Официальный Diyanet API (Рекомендуется для Турции)",
        lbl_prayer_src_aladhan: "Aladhan API (Рекомендуется по всему миру)",
        lbl_diyanet_loc: "📍 Выбор местоположения Diyanet",
        lbl_country: "Страна",
        lbl_state: "Область / Регион",
        lbl_city: "Район / Город",
        lbl_aladhan_method: "⚙️ Выбор метода Aladhan",
        lbl_prayer_method: "Метод расчета",
        lbl_aladhan_warning: "⚠️ Внимание: Этот метод использует математические расчеты; возможны небольшие расхождения (1-2 минуты) с официальным расписанием.",
        lbl_tbl_icon: "Иконка",
        lbl_tbl_name: "Имя",
        lbl_tbl_path: "Путь / URL",
        lbl_tbl_action: "Действие",
        lbl_add_shortcut_btn: "+ Добавить новый ярлык",
        lbl_shortcut_diag_title: "Добавить ярлык",
        lbl_shortcut_diag_name: "Название ярлыка",
        lbl_shortcut_diag_path: "Путь к приложению или веб-ссылка",
        lbl_shortcut_diag_icon: "Иконка Emoji",
        lbl_event_diag_title: "Добавить событие",
        lbl_event_diag_summary: "Заголовок события",
        lbl_event_diag_start: "Время начала",
        lbl_event_diag_end: "Время окончания",
        lbl_cal_sync: "Синхронизация событий (.ics)",
        lbl_cal_help: "Вы можете добавить пути к локальным файлам (.ics) или ссылки iCal от Google Календаря.",
        lbl_cal_add_source: "+ Добавить источник календаря",
        lbl_cal_upload: "Загрузить файл ICS",
        lbl_cal_gcal_title: "Как добавить Google Календарь?",
        lbl_cal_gcal_step1: "1. Откройте Google Календарь, нажмите три точки рядом с вашим календарем слева, выберите 'Настройки и общий доступ'.",
        lbl_cal_gcal_step2: "2. Прокрутите страницу до конца и скопируйте ссылку рядом с 'Закрытый адрес в формате iCal'.",
        lbl_cal_gcal_step3: "3. Вставьте скопированную ссылку в одно из полей ввода выше.",
        lbl_ai_key_title: "Ключ Gemini API",
        lbl_ai_key_placeholder: "Введите ключ Gemini API для ответов ИИ",
        lbl_ai_key_desc: "При указании ключа API ассистент сможет отвечать на общие вопросы через Gemini. Без ключа будут выполняться только локальные команды.",
        btn_save: "Сохранить настройки",
        btn_cancel: "Отмена",
        lbl_add_btn: "Добавить",
        lbl_tb_back: "Назад",
        lbl_tb_brush: "Размер",
        lbl_tb_text: "Текст",
        lbl_tb_eraser: "Ластик",
        lbl_tb_undo: "Отменить",
        lbl_tb_clear: "Очистить",
        lbl_tb_save: "Сохранить",
        lbl_weather_forecast: "Подробная погода",
        lbl_hourly: "Почасовой прогноз (Сегодня)",
        lbl_daily: "Ежедневный прогноз (7 Дней)",
        lbl_change_loc: "Изменить локацию",
        lbl_gps_auto: "Определить положение",
        lbl_today: "Сегодня",
        search_google: "Поиск в Google...",
        search_startpage: "Поиск в StartPage...",
        search_duckduckgo: "Поиск в DuckDuckGo...",
        imsak: "Фаджр",
        gunes: "Восход",
        ogle: "Зухр",
        ikindi: "Аср",
        aksam: "Магриб",
        yatsi: "Иша",
        fullscreen_btn: "Полный экран",
        desktop_promo: "Попробуйте nilTab Desktop",
        quote_verse: "Аят дня",
        quote_hadith: "Хадис дня",
        media_no_playback: "Музыка не воспроизводится",
        media_waiting: "Ожидание медиа",
        media_title: "Медиаплеер",
        media_artist: "Управление медиа активно",
        gps_searching: "Поиск GPS...",
        gps_not_supported: "GPS не поддерживается.",
        gps_resolving: "Определение адреса...",
        gps_located: "Найдено",
        gps_denied: "Доступ к геопозиции отклонен",
        gps_coord_saved: "Сохранено по координатам.",
        city_search_searching: "Поиск...",
        city_search_not_found: "Город не найден.",
        city_search_saved: "Локация обновлена.",
        file_save_error: "Произошла ошибка при сохранении файла.",
        lbl_about_privacy_title: "О приложении & Конфиденциальность",
        lbl_about_privacy_text: "NilTab работает локально. Ваше местоположение, настройки и данные календаря обрабатываются исключительно на вашем устройстве и не передаются третьим лицам. Голосовой помощник использует встроенные возможности браузера."
    },
    mk: {
        weather: "ВРЕМЕ",
        prayer: "МОЛИТВЕНИ ВРЕМИЊА",
        shortcuts: "КРАТЕНКИ",
        quote: "Стих / Хадис на денот",
        calendar: "Календар & Настани",
        upcoming: "Претстојни",
        focus_btn: "Фокус Мод",
        board_btn: "Табла",
        voice_btn: "ВЕ Асистент",
        settings_btn: "Поставки",
        exit_btn: "Излез",
        focus_exit_info: "Кликнете двапати за излез",
        listening: "Ве слушам...",
        speak_info: "Допрете го микрофонот за да зборувате.",
        whats_next: "Следна молитва...",
        no_prayer: "Времињата за молитва не се достапни.",
        remaining: "преостанато",
        until: "до",
        countdown_template: "{time} преостанато до {name}",
        clear_confirm: "Дали сте сигурни дека сакате да го исчистите цртежот?",
        drawing_saved: "Цртежот е зачуван",
        drawing_downloaded: "Цртежот е преземен!",
        local_app_warning: "Стартувањето на локални апликации е поддржано само во десктоп верзијата.",
        field_required: "Полињата Име и Патека/URL не смеат да бидат празни.",
        cal_field_required: "Полињата Наслов и Време на почеток се задолжителни.",
        ics_imported: "настани се увезени!",
        no_ics_events: "Не се пронајдени валидни настани во календарот.",
        no_events: "Нема претстојни настани.",
        hours: "ч",
        minutes: "мин",
        seconds: "сек",
        settings_title: "Поставки",
        tab_general: "Општо",
        tab_widgets: "Виџети",
        tab_shortcuts: "Кратенки",
        tab_calendar: "Календар",
        tab_ai: "ВЕ",
        lbl_language: "Јазик",
        lbl_mode: "Режим на излез од чувар на екран",
        lbl_mode_scr: "Класичен (се затвора на движење на глувчето)",
        lbl_mode_int: "Интерактивен (Притиснете Esc за излез)",
        lbl_focus_clock: "Прикажи часовник во фокус мод?",
        lbl_bg_type: "Тип на позадина",
        lbl_bg_type_video: "Видео",
        lbl_bg_type_image: "Слика",
        lbl_bg_type_grad: "Динамичен градиент (Стандардно)",
        lbl_bg_path: "Избери датотека за позадина",
        lbl_bg_select: "Избери датотека",
        lbl_bg_blur: "Заматеност на позадина",
        lbl_bg_brightness: "Осветленост на позадина",
        lbl_bg_presets: "Готови позадини",
        tab_weather_heading: "Поставки за време",
        lbl_weather_show: "Прикажи виџет за време",
        lbl_weather_city: "Име на град",
        lbl_weather_search: "Пребарај & Зачувај",
        tab_prayer_heading: "Поставки за молитвени времиња",
        lbl_prayer_show: "Прикажи виџет за молитвени времиња",
        lbl_prayer_source: "Извор на податоци",
        lbl_prayer_src_diyanet: "Официјален Дијанет API (Препорачано за Турција)",
        lbl_prayer_src_aladhan: "Aladhan API (Препорачано за целиот свет)",
        lbl_diyanet_loc: "📍 Дијанет избор на локација",
        lbl_country: "Држава",
        lbl_state: "Регион",
        lbl_city: "Град",
        lbl_aladhan_method: "⚙️ Избор на метода Aladhan",
        lbl_prayer_method: "Метод на пресметка",
        lbl_aladhan_warning: "⚠️ Внимание: Овој метод користи математички пресметки; можни се мали отстапувања (1-2 минути) од официјалните календари.",
        lbl_tbl_icon: "Икона",
        lbl_tbl_name: "Име",
        lbl_tbl_path: "Патека / URL",
        lbl_tbl_action: "Дејство",
        lbl_add_shortcut_btn: "+ Додај нова кратенка",
        lbl_shortcut_diag_title: "Додај кратенка",
        lbl_shortcut_diag_name: "Име на кратенка",
        lbl_shortcut_diag_path: "Патека до апликација или веб-линк",
        lbl_shortcut_diag_icon: "Емоџи икона",
        lbl_event_diag_title: "Додај настан",
        lbl_event_diag_summary: "Наслов на настан",
        lbl_event_diag_start: "Време на почеток",
        lbl_event_diag_end: "Време на крај",
        lbl_cal_sync: "Синхронизација на настани (.ics)",
        lbl_cal_help: "Може да додадете локални патеки за (.ics) датотеки или тајни iCal линкови од Google Календар.",
        lbl_cal_add_source: "+ Додај извор на календар",
        lbl_cal_upload: "Прикачи ICS датотека",
        lbl_cal_gcal_title: "Како да додадете Google Календар?",
        lbl_cal_gcal_step1: "1. Отворете Google Календар, кликнете на трите точки до вашиот календар лево и изберете 'Поставки и споделување'.",
        lbl_cal_gcal_step2: "2. Скролувајте до дното и копирајте ја URL адресата под 'Тајна адреса во iCal формат'.",
        lbl_cal_gcal_step3: "3. Залепете ја копираната URL адреса во едно од полињата погоре.",
        lbl_ai_key_title: "Клуч за Gemini API",
        lbl_ai_key_placeholder: "Внесете Gemini API клуч за одговори од ВЕ",
        lbl_ai_key_desc: "Кога е внесен API клучот, вашиот асистент може да одговара на општи прашања преку Gemini. Ако не е внесен клуч, извршува само локални команди.",
        btn_save: "Зачувај поставки",
        btn_cancel: "Откажи",
        lbl_add_btn: "Додај",
        lbl_tb_back: "Назад",
        lbl_tb_brush: "Големина",
        lbl_tb_text: "Текст",
        lbl_tb_eraser: "Гума",
        lbl_tb_undo: "Врати",
        lbl_tb_clear: "Исчисти",
        lbl_tb_save: "Зачувај",
        lbl_weather_forecast: "Детална временска прогноза",
        lbl_hourly: "Часовна прогноза (Денес)",
        lbl_daily: "Дневна прогноза (7 Дена)",
        lbl_change_loc: "Промени локација",
        lbl_gps_auto: "Најди ја мојата локација",
        lbl_today: "Денес",
        search_google: "Пребарај со Google...",
        search_startpage: "Пребарај со StartPage...",
        search_duckduckgo: "Пребарај со DuckDuckGo...",
        imsak: "Имсак",
        gunes: "Изгрејсонце",
        ogle: "Пладне",
        ikindi: "Икиндија",
        aksam: "Акшам",
        yatsi: "Јација",
        fullscreen_btn: "Цел екран",
        desktop_promo: "Пробајте го nilTab Desktop",
        quote_verse: "Стих на денот",
        quote_hadith: "Хадис на денот",
        media_no_playback: "Не се пушта музика",
        media_waiting: "Се чека медиум",
        media_title: "Медиа плеер",
        media_artist: "Медиа контролите се активни",
        gps_searching: "Се бара GPS...",
        gps_not_supported: "GPS не е поддржан.",
        gps_resolving: "Се одредува адресата...",
        gps_located: "Пронајдено",
        gps_denied: "Дозволата за локација е одбиена",
        gps_coord_saved: "Зачувано со координати.",
        city_search_searching: "Се пребарува...",
        city_search_not_found: "Градот не е пронајден.",
        city_search_saved: "Локацијата е ажурирана.",
        file_save_error: "Се појави грешка при зачувување на датотеката.",
        lbl_about_privacy_title: "За апликацијата & Приватност",
        lbl_about_privacy_text: "NilTab работи локално. Вашата локација, поставки и календарски податоци се обработуваат на вашиот уред и никогаш не се споделуваат со надворешни сервери. Гласовниот асистент користи вградено препознавање глас од прелистувачот."
    }
};

// Whiteboard variables
let canvas, ctx;
let drawing = false;
let brushColor = "#ffffff";
let brushSize = 5;
let drawingHistory = [];
let drawingRedoHistory = [];
let isEraser = false;
let isTextTool = false;
let textX = 0, textY = 0;

// Voice recognition variables
let recognition;
let isListening = false;
let waveAnimationId;

// Focus mode floating clock variables
let focusInterval;
let loadedPrayers = null;
let displayedMonth = new Date().getMonth();
let displayedYear = new Date().getFullYear();

// --- IndexedDB Local File Persistence for Web Mode ---
const DB_NAME = 'NilTabDB';
const STORE_NAME = 'backgrounds';
let activeBgObjectUrl = null;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

async function saveBackgroundBlob(blob) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(blob, 'active_background');
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

async function getBackgroundBlob() {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get('active_background');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

// Initialize when page loads (completely web native)
window.addEventListener('DOMContentLoaded', () => {
    console.log("NilTab initializing...");
    loadSettingsAndInit();
});

// --- Initialization ---
async function loadSettingsAndInit() {
    const stored = localStorage.getItem('niltab_settings') || localStorage.getItem('nilsaver_settings');
    const defaultSettings = {
        "mode": "interactive",
        "background_type": "gradient",
        "background_path": "",
        "background_blur": 0,
        "background_brightness": 80,
        "weather_enabled": true,
        "weather_city": "Izmir",
        "weather_lat": 38.4127,
        "weather_lon": 27.1384,
        "prayer_enabled": true,
        "prayer_source": "diyanet",
        "prayer_method": 13,
        "prayer_country_id": 2,
        "prayer_state_id": 540,
        "prayer_city_id": 9560,
        "prayer_city_name": "İZMİR",
        "calendar_sync_ics": [],
        "calendar_local_events": [
            { "summary": "Örnek Etkinlik", "start": "2026-08-06T19:00:00", "end": "2026-08-06T20:00:00", "source": "Local" }
        ],
        "shortcuts": [
            { "name": "YouTube", "url": "https://youtube.com", "icon": "📺" },
            { "name": "Google", "url": "https://google.com", "icon": "🔍" }
        ],
        "focus_clock_enabled": true,
        "gemini_api_key": "",
        "search_engine": "google"
    };

    if (stored) {
        try {
            appSettings = JSON.parse(stored);
            // Merge defaults to ensure no fields are missing
            for (const k in defaultSettings) {
                if (appSettings[k] === undefined) {
                    appSettings[k] = defaultSettings[k];
                }
            }
        } catch (e) {
            appSettings = defaultSettings;
        }
    } else {
        appSettings = defaultSettings;
    }
    initApp();
    setupSearchBar();
    setupEventListeners();
    setupScreensaverExitRules();
}

function initApp() {
    if (appSettings.language === 'ar') {
        appSettings.language = 'tr';
    }
    appSettings.language = appSettings.language || 'tr';
    applyTranslations();
    displayedMonth = new Date().getMonth();
    displayedYear = new Date().getFullYear();
    applyBackground();
    initClock();
    initWeather();
    initPrayerTimes();
    initCalendar();
    initShortcuts();
    initQuoteWidget();
    initMediaController();
    
    const activeEngine = appSettings.search_engine || 'google';
    setSearchEngine(activeEngine);

    // Auto geolocate on first website visit
    if (!localStorage.getItem('niltab_geolocated') && !localStorage.getItem('nilsaver_geolocated')) {
        localStorage.setItem('niltab_geolocated', 'true');
        requestGeolocationAndSave();
    }
}

// --- Background Renderer ---
async function applyBackground() {
    const bgContainer = document.getElementById('bg-container');
    const bgGradient = document.getElementById('bg-gradient');
    const bgImage = document.getElementById('bg-image');
    const bgVideo = document.getElementById('bg-video');
    const bgOverlay = document.getElementById('bg-overlay');

    // Deactivate all layers
    bgGradient.classList.remove('active');
    bgImage.classList.remove('active');
    bgVideo.classList.remove('active');

    // Set filter style
    const blurVal = appSettings.background_blur || 0;
    const brightnessVal = appSettings.background_brightness !== undefined ? appSettings.background_brightness : 70;
    bgOverlay.style.backdropFilter = blurVal > 0 ? `blur(${blurVal}px)` : 'none';
    bgOverlay.style.backgroundColor = `rgba(0, 0, 0, ${1 - (brightnessVal / 100)})`;

    // Revoke previous object URL if any to release memory
    if (activeBgObjectUrl) {
        URL.revokeObjectURL(activeBgObjectUrl);
        activeBgObjectUrl = null;
    }

    let finalPath = appSettings.background_path;

    if (finalPath === 'stored_local_file') {
        try {
            const blob = await getBackgroundBlob();
            if (blob) {
                activeBgObjectUrl = URL.createObjectURL(blob);
                finalPath = activeBgObjectUrl;
            } else {
                finalPath = ''; // Fallback if blob doesn't exist
            }
        } catch (err) {
            console.error("Failed to load background from IndexedDB:", err);
            finalPath = '';
        }
    }

    if (appSettings.background_type === 'image' && finalPath) {
        bgImage.src = finalPath;
        bgImage.classList.add('active');
    } else if (appSettings.background_type === 'video' && finalPath) {
        // Always pause and reset before assigning a new source
        bgVideo.pause();
        bgVideo.removeAttribute('src');
        bgVideo.load();
        bgVideo.src = finalPath;
        bgVideo.load();
        bgVideo.onerror = (e) => console.error("Video load error:", e, bgVideo.error);
        bgVideo.play().catch(e => console.warn("Video autoplay blocked:", e));
        bgVideo.classList.add('active');
    } else {
        // Gradient fallback
        bgGradient.classList.add('active');
    }
}

// --- Digital Clock ---
function initClock() {
    updateClock();
    if (!clockIntervalId) {
        clockIntervalId = setInterval(updateClock, 1000);
    }
}

function updateClock() {
    const now = new Date();

    // Time components
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    const hm = `${hrs}:${mins}`;

    // Update only the seconds span — do NOT touch the HM span to avoid layout jitter
    const hmEl = document.getElementById('clock-hm');
    const secsEl = document.getElementById('clock-seconds');
    if (hmEl) hmEl.textContent = hm;
    if (secsEl) secsEl.textContent = `:${secs}`;

    // Focus Mode Clock — same approach
    const focusHmEl = document.getElementById('focus-hm');
    const focusSecsEl = document.getElementById('focus-seconds');
    if (focusHmEl) focusHmEl.textContent = hm;
    if (focusSecsEl) focusSecsEl.textContent = `:${secs}`;

    // Date — locale based on language setting
    const lang = appSettings.language || 'tr';
    const localeMap = { tr: 'tr-TR', en: 'en-US', de: 'de-DE', ru: 'ru-RU', mk: 'mk-MK' };
    const locale = localeMap[lang] || 'tr-TR';
    const options = { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' };
    document.getElementById('main-date').textContent = now.toLocaleDateString(locale, options);

    // Update prayer countdown every second if timings are loaded
    if (loadedPrayers) {
        updateActivePrayerTime(loadedPrayers);
    }
}

// --- Weather Widget ---
async function initWeather() {
    const card = document.getElementById('weather-widget');
    if (!appSettings.weather_enabled) {
        card.style.display = 'none';
        if (weatherIntervalId) {
            clearInterval(weatherIntervalId);
            weatherIntervalId = null;
        }
        return;
    }
    card.style.display = 'block';

    // 5 dakikada bir otomatik yenileme (Auto refresh every 5 minutes)
    if (weatherIntervalId) {
        clearInterval(weatherIntervalId);
    }
    weatherIntervalId = setInterval(initWeather, WEATHER_UPDATE_INTERVAL);

    const city = appSettings.weather_city || 'Istanbul';
    const lat = appSettings.weather_lat || 41.0082;
    const lon = appSettings.weather_lon || 28.9784;

    document.getElementById('weather-location').textContent = city;

    try {
        // Query current conditions, hourly predictions (for details modal), and daily forecast
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`);
        if (!response.ok) throw new Error("HTTP error");
        const data = await response.json();

        lastWeatherData = data; // Keep cached for clicking forecast popup modal
        lastWeatherFetchTime = Date.now();
        const cw = data.current_weather;

        // Temperature
        document.getElementById('weather-temp').textContent = `${Math.round(cw.temperature)}°C`;

        // Code translation
        const codeMap = getWeatherCodeDetails(cw.weathercode);
        document.getElementById('weather-icon').textContent = codeMap.icon;
        document.getElementById('weather-desc').textContent = codeMap.desc;

        // Detaylı hava durumu modalı açıksa onu da anlık güncelle
        const weatherModal = document.getElementById('weather-modal');
        if (weatherModal && !weatherModal.classList.contains('hidden')) {
            renderForecastModal(lastWeatherData);
        }
    } catch (e) {
        console.error("Failed to fetch weather:", e);
        if (!lastWeatherData) {
            document.getElementById('weather-temp').textContent = '--°C';
            const lang = appSettings.language || 'tr';
            document.getElementById('weather-desc').textContent = lang === 'en' ? 'Error: Fetch failed' : 'Hata: Alınamadı';
        }
    }
}

function getWeatherCodeDetails(code) {
    const lang = appSettings.language || 'tr';
    const codes = {
        0: { icon: "☀️", tr: "Açık Gökyüzü", en: "Clear Sky", de: "Klarer Himmel", ru: "Ясно", mk: "Ведро небо" },
        1: { icon: "🌤️", tr: "Çoğunlukla Açık", en: "Mainly Clear", de: "Überwiegend klar", ru: "Преимущественно ясно", mk: "Главно ведро" },
        2: { icon: "⛅", tr: "Parçalı Bulutlu", en: "Partly Cloudy", de: "Teilweise bewölkt", ru: "Переменная облачность", mk: "Делумно облачно" },
        3: { icon: "☁️", tr: "Bulutlu", en: "Overcast", de: "Bedeckt", ru: "Пасмурно", mk: "Облачно" },
        45: { icon: "🌫️", tr: "Sisli", en: "Foggy", de: "Nebelig", ru: "Туман", mk: "Магливо" },
        48: { icon: "🌫️", tr: "Kırağı Sisi", en: "Depositing Rime Fog", de: "Raureifnebel", ru: "Изморозь", mk: "Иње магла" },
        51: { icon: "🌧️", tr: "Hafif Çiseleme", en: "Light Drizzle", de: "Leichter Nieselregen", ru: "Легкая морось", mk: "Слаб росеж" },
        53: { icon: "🌧️", tr: "Orta Çiseleme", en: "Moderate Drizzle", de: "Mäßiger Nieselregen", ru: "Умеренная морось", mk: "Умерен росеж" },
        55: { icon: "🌧️", tr: "Yoğun Çiseleme", en: "Dense Drizzle", de: "Dichter Nieselregen", ru: "Густая морось", mk: "Густ росеж" },
        61: { icon: "🌧️", tr: "Hafif Yağmur", en: "Slight Rain", de: "Leichter Regen", ru: "Небольшой дождь", mk: "Слаб дожд" },
        63: { icon: "🌧️", tr: "Yağmurlu", en: "Rainy", de: "Regnerisch", ru: "Дождь", mk: "Дождливо" },
        65: { icon: "🌧️", tr: "Şiddetli Yağmur", en: "Heavy Rain", de: "Starker Regen", ru: "Сильный дождь", mk: "Силен дожд" },
        71: { icon: "❄️", tr: "Hafif Kar", en: "Slight Snow", de: "Leichter Schneefall", ru: "Небольшой снег", mk: "Слаб снег" },
        73: { icon: "❄️", tr: "Kar Yağışlı", en: "Snowy", de: "Schneefall", ru: "Снегопад", mk: "Снежно" },
        75: { icon: "❄️", tr: "Yoğun Kar", en: "Heavy Snow", de: "Starker Schneefall", ru: "Сильный снегопад", mk: "Силен снег" },
        80: { icon: "🌦️", tr: "Hafif Sağanak", en: "Slight Rain Shower", de: "Leichte Regenschauer", ru: "Слабый ливень", mk: "Слаб пороен дожд" },
        81: { icon: "🌦️", tr: "Sağanak Yağış", en: "Rain Showers", de: "Regenschauer", ru: "Ливень", mk: "Пороен дожд" },
        82: { icon: "🌦️", tr: "Şiddetli Sağanak", en: "Heavy Rain Showers", de: "Starke Regenschauer", ru: "Сильный ливень", mk: "Силен пороен дожд" },
        95: { icon: "⛈️", tr: "Fırtına", en: "Thunderstorm", de: "Gewitter", ru: "Гроза", mk: "Грмотевична бура" },
        96: { icon: "⛈️", tr: "Dolu Fırtınası", en: "Thunderstorm with Hail", de: "Gewitter mit Hagel", ru: "Гроза с градом", mk: "Бура со град" },
        99: { icon: "⛈️", tr: "Şiddetli Fırtına", en: "Heavy Thunderstorm", de: "Schweres Gewitter", ru: "Сильная гроза", mk: "Силна грмотевична бура" }
    };
    const c = codes[code] || { icon: "⛅", tr: "Bulutlu", en: "Cloudy", de: "Bewölkt", ru: "Облачно", mk: "Облачно" };
    return { icon: c.icon, desc: c[lang] || c.en || c.tr };
}

function togglePrayerSourceUI(source) {
    const diyanetGroup = document.getElementById('diyanet-selectors-group');
    const aladhanGroup = document.getElementById('aladhan-selectors-group');
    if (!diyanetGroup || !aladhanGroup) return;
    if (source === 'diyanet') {
        diyanetGroup.classList.remove('hidden');
        aladhanGroup.classList.add('hidden');
    } else {
        diyanetGroup.classList.add('hidden');
        aladhanGroup.classList.remove('hidden');
    }
}

// --- Diyanet API Helper & Caching ---
const DIYANET_API_BASE = "https://nilsaver.abdullahnil.com";

async function fetchDiyanet(endpoint) {
    const cacheKey = `diyanet_cache_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (endpoint.includes('/api/Place') && (Date.now() - parsed.timestamp < 30 * 24 * 60 * 60 * 1000)) {
                return parsed.data;
            }
        } catch (e) {}
    }

    const response = await fetch(`${DIYANET_API_BASE}${endpoint}`);

    if (!response.ok) {
        throw new Error(`Diyanet request failed for ${endpoint}: ${response.status}`);
    }

    const res = await response.json();
    if (!res.success) {
        throw new Error(res.message || `Diyanet request failed for ${endpoint}`);
    }

    if (endpoint.includes('/api/Place')) {
        localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            data: res.data
        }));
    }

    return res.data;
}

async function initSettingsPrayerDropdowns() {
    const countrySelect = document.getElementById('setting-prayer-country');
    const stateSelect = document.getElementById('setting-prayer-state');
    const citySelect = document.getElementById('setting-prayer-city');

    if (!countrySelect || !stateSelect || !citySelect) return;

    countrySelect.innerHTML = '<option value="">Yükleniyor...</option>';
    stateSelect.innerHTML = '<option value="">Önce Ülke Seçin</option>';
    stateSelect.disabled = true;
    citySelect.innerHTML = '<option value="">Önce İl Seçin</option>';
    citySelect.disabled = true;

    try {
        const countries = await fetchDiyanet('/api/Place/Countries');
        countrySelect.innerHTML = countries.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        
        const savedCountryId = appSettings.prayer_country_id || 2;
        countrySelect.value = savedCountryId;

        await loadStatesForCountry(savedCountryId);
    } catch (e) {
        console.error("Failed to load countries:", e);
        countrySelect.innerHTML = '<option value="">Hata Oluştu</option>';
    }
}

async function loadStatesForCountry(countryId) {
    const stateSelect = document.getElementById('setting-prayer-state');
    const citySelect = document.getElementById('setting-prayer-city');
    if (!stateSelect) return;

    stateSelect.innerHTML = '<option value="">Yükleniyor...</option>';
    stateSelect.disabled = true;
    if (citySelect) {
        citySelect.innerHTML = '<option value="">Önce İl Seçin</option>';
        citySelect.disabled = true;
    }

    try {
        const states = await fetchDiyanet(`/api/Place/States/${countryId}`);
        if (states && states.length > 0) {
            stateSelect.innerHTML = states.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
            stateSelect.disabled = false;

            const savedStateId = appSettings.prayer_state_id;
            if (savedStateId && appSettings.prayer_country_id === countryId) {
                stateSelect.value = savedStateId;
                await loadCitiesForState(savedStateId);
            } else {
                stateSelect.value = states[0].id;
                await loadCitiesForState(states[0].id);
            }
        } else {
            stateSelect.innerHTML = '<option value="">Eyalet/İl Yok</option>';
        }
    } catch (e) {
        console.error("Failed to load states:", e);
        stateSelect.innerHTML = '<option value="">Hata Oluştu</option>';
    }
}

async function loadCitiesForState(stateId) {
    const citySelect = document.getElementById('setting-prayer-city');
    if (!citySelect) return;

    citySelect.innerHTML = '<option value="">Yükleniyor...</option>';
    citySelect.disabled = true;

    try {
        const cities = await fetchDiyanet(`/api/Place/Cities/${stateId}`);
        if (cities && cities.length > 0) {
            citySelect.innerHTML = cities.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
            citySelect.disabled = false;

            const savedCityId = appSettings.prayer_city_id;
            if (savedCityId && appSettings.prayer_state_id === stateId) {
                citySelect.value = savedCityId;
            } else {
                citySelect.value = cities[0].id;
            }
        } else {
            citySelect.innerHTML = '<option value="">İlçe/Şehir Yok</option>';
        }
    } catch (e) {
        console.error("Failed to load cities:", e);
        citySelect.innerHTML = '<option value="">Hata Oluştu</option>';
    }
}

function getFormattedTodayDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}.${month}.${year}`;
}

// --- Prayer Times Widget ---
async function initPrayerTimes() {
    const card = document.getElementById('prayer-widget');
    if (!appSettings.prayer_enabled) {
        card.style.display = 'none';
        return;
    }
    card.style.display = 'block';

    const source = appSettings.prayer_source || 'diyanet';

    if (source === 'diyanet') {
        const cityId = appSettings.prayer_city_id || 9560;
        const cityName = appSettings.prayer_city_name || appSettings.weather_city || 'İzmir';
        const cityEl = document.getElementById('prayer-city');
        if (cityEl) {
            cityEl.textContent = cityName;
            cityEl.title = 'Resmi Diyanet REST API';
        }

        try {
            let timesData = null;
            const cacheKey = `diyanet_prayer_times_${cityId}`;
            const cached = localStorage.getItem(cacheKey);
            
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (parsed && parsed.times && parsed.times.length > 0) {
                        const todayStr = getFormattedTodayDate();
                        const todayEntry = parsed.times.find(t => t.gregorianDateShort === todayStr);
                        if (todayEntry) {
                            timesData = parsed.times;
                        }
                    }
                } catch (e) {
                    console.error("Error reading prayer times cache:", e);
                }
            }
            
            if (!timesData) {
                console.log(`Cache miss for prayer times of city ${cityId}. Fetching from Diyanet API...`);
                timesData = await fetchDiyanet(`/api/PrayerTime/Monthly/${cityId}`);
                localStorage.setItem(cacheKey, JSON.stringify({
                    timestamp: Date.now(),
                    cityId: cityId,
                    times: timesData
                }));
            }
            
            const todayStr = getFormattedTodayDate();
            const todayEntry = timesData.find(t => t.gregorianDateShort === todayStr);
            
            if (!todayEntry) {
                throw new Error(`No prayer time found for today (${todayStr}) in Diyanet response.`);
            }
            
            const prayers = {
                imsak: todayEntry.fajr,
                gunes: todayEntry.sunrise,
                ogle: todayEntry.dhuhr,
                ikindi: todayEntry.asr,
                aksam: todayEntry.maghrib,
                yatsi: todayEntry.isha
            };

            for (const [id, val] of Object.entries(prayers)) {
                const el = document.querySelector(`#pt-${id} .pt-val`);
                if (el) el.textContent = val;
            }

            loadedPrayers = prayers;
            updateActivePrayerTime(prayers);
        } catch (e) {
            console.error("Failed to fetch Diyanet prayer times:", e);
            document.getElementById('prayer-next').textContent = 'Vakitler alınamadı.';
        }
    } else {
        const city = appSettings.weather_city || 'Istanbul';
        const lat = appSettings.weather_lat || 41.0082;
        const lon = appSettings.weather_lon || 28.9784;
        const method = appSettings.prayer_method || 13;

        const cityEl = document.getElementById('prayer-city');
        if (cityEl) {
            cityEl.textContent = `${city} (Hesaplama) ⚠️`;
            cityEl.title = 'Not: Bu yöntem matematiksel hesaplama kullanır, resmi Diyanet takvimiyle ufak sapmalar (1-2 dakika) gösterebilir.';
        }

        try {
            const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=${method}`);
            if (!response.ok) throw new Error("HTTP error");
            const data = await response.json();
            const timings = data.data.timings;

            const prayers = {
                imsak: timings.Fajr,
                gunes: timings.Sunrise,
                ogle: timings.Dhuhr,
                ikindi: timings.Asr,
                aksam: timings.Maghrib,
                yatsi: timings.Isha
            };

            for (const [id, val] of Object.entries(prayers)) {
                const el = document.querySelector(`#pt-${id} .pt-val`);
                if (el) el.textContent = val;
            }

            loadedPrayers = prayers;
            updateActivePrayerTime(prayers);
        } catch (e) {
            console.error("Failed to fetch Aladhan prayer times:", e);
            document.getElementById('prayer-next').textContent = 'Vakitler alınamadı.';
        }
    }
}

function updateActivePrayerTime(prayers) {
    if (!prayers) return;
    const now = new Date();
    const currTimeSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const lang = appSettings.language || 'tr';
    const t = i18n[lang] || i18n.tr;

    function toSeconds(tStr) {
        const parts = tStr.split(':');
        return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60;
    }

    const times = [
        { name: t.imsak, id: "imsak", sec: toSeconds(prayers.imsak) },
        { name: t.gunes, id: "gunes", sec: toSeconds(prayers.gunes) },
        { name: t.ogle, id: "ogle", sec: toSeconds(prayers.ogle) },
        { name: t.ikindi, id: "ikindi", sec: toSeconds(prayers.ikindi) },
        { name: t.aksam, id: "aksam", sec: toSeconds(prayers.aksam) },
        { name: t.yatsi, id: "yatsi", sec: toSeconds(prayers.yatsi) }
    ];

    // Remove active styles
    times.forEach(item => {
        const el = document.getElementById(`pt-${item.id}`);
        if (el) el.classList.remove('active');
    });

    let activeIdx = 5; // Default to Yatsı if none matches
    let nextIdx = 0;

    for (let i = 0; i < 5; i++) {
        if (currTimeSec >= times[i].sec && currTimeSec < times[i + 1].sec) {
            activeIdx = i;
            nextIdx = i + 1;
            break;
        }
    }

    if (activeIdx === 5) {
        nextIdx = 0; // Next is Fajr tomorrow
    }

    // Mark current active
    const activeEl = document.getElementById(`pt-${times[activeIdx].id}`);
    if (activeEl) activeEl.classList.add('active');

    // Calculate time left to next vakit
    let nextTimeSec = times[nextIdx].sec;
    let diff;
    if (activeIdx === 5 && currTimeSec > nextTimeSec) {
        // Next is imsak tomorrow (86400 seconds in a day)
        diff = (86400 - currTimeSec) + nextTimeSec;
    } else {
        diff = nextTimeSec - currTimeSec;
    }

    const diffHrs = Math.floor(diff / 3600);
    const diffMins = Math.floor((diff % 3600) / 60);
    const diffSecs = diff % 60;

    let countdownStr = "";
    if (diffHrs > 0) countdownStr += `${diffHrs}${t.hours} `;
    if (diffMins > 0 || diffHrs > 0) countdownStr += `${diffMins}${t.minutes} `;
    countdownStr += `${diffSecs}${t.seconds}`;

    const nextPrayerName = times[nextIdx].name;
    const template = t.countdown_template || "{time} remaining until {name}";
    const formattedCountdown = template
        .replace('{name}', nextPrayerName)
        .replace('{time}', countdownStr);

    document.getElementById('prayer-next').textContent = formattedCountdown;
}

// --- Günün Ayeti / Hadisi Widget ---
let currentQuoteIndex = 0;

const inspirationalQuotes = [
    {
        type: "Ayet",
        text_tr: "Şüphesiz her zorlukla beraber bir kolaylık vardır.",
        source_tr: "İnşirah, 5",
        text_en: "Indeed, with hardship comes ease.",
        source_en: "Ash-Sharh 94:5",
        text_de: "Wahrlich, mit der Erschwernis kommt die Erleichterung.",
        source_de: "Al-Inschirah 94:5",
        text_ru: "Воистину, за тягостью наступает облегчение.",
        source_ru: "Аль-Инширах 94:5",
        text_mk: "Навистина, со секоја тешкотија доаѓа и олеснување.",
        source_mk: "Инширах 94:5"
    },
    {
        type: "Ayet",
        text_tr: "Rabbim! Göğsümü genişlet, işimi kolaylaştır.",
        source_tr: "Tâhâ, 25-26",
        text_en: "My Lord, expand for me my breast and ease for me my task.",
        source_en: "Ta-Ha 20:25-26",
        text_de: "Mein Herr, weite mir meine Brust und erleichtere mir meine Aufgabe.",
        source_de: "Ta-Ha 20:25-26",
        text_ru: "Господи! Раскрой для меня мою грудь и облегчи мою задачу.",
        source_ru: "Та Ха 20:25-26",
        text_mk: "Господару мој! Прошири ги моите гради и олесни ми ја задачата.",
        source_mk: "Таха 20:25-26"
    },
    {
        type: "Hadis",
        text_tr: "Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz.",
        source_tr: "Buhari, İlim 11",
        text_en: "Make things easy and do not make them difficult, cheer people up and do not drive them away.",
        source_en: "Bukhari, Ilm 11",
        text_de: "Macht die Dinge leicht und erschwert sie nicht; verkündet frohe Botschaft und schreckt nicht ab.",
        source_de: "Buchari, Ilm 11",
        text_ru: "Облегчайте и не усложняйте, радуйте благой вестью и не внушайте отвращение.",
        source_ru: "Бухари, Ильм 11",
        text_mk: "Олеснувајте, а не отежнувајте; радувајте, а не одбивајте.",
        source_mk: "Бухари, Илм 11"
    },
    {
        type: "Ayet",
        text_tr: "Bana dua edin, size cevap vereyim.",
        source_tr: "Mü'min, 60",
        text_en: "Call upon Me; I will respond to you.",
        source_en: "Ghafir 40:60",
        text_de: "Ruft Mich an, so erhöre Ich euch.",
        source_de: "Ghafir 40:60",
        text_ru: "Взывайте ко Мне, и Я отвечу вам.",
        source_ru: "Гафир 40:60",
        text_mk: "Повикајте Ме, Јас ќе ви се одѕвијам.",
        source_mk: "Гафир 40:60"
    },
    {
        type: "Hadis",
        text_tr: "İki nimet vardır ki insanların çoğu onlarda aldanmıştır: Sağlık ve boş vakit.",
        source_tr: "Buhari, Rikak 1",
        text_en: "There are two blessings which many people lose: health and free time.",
        source_en: "Bukhari, Riqaq 1",
        text_de: "Zwei Gaben gibt es, bei denen viele Menschen getäuscht werden: Gesundheit und freie Zeit.",
        source_de: "Buchari, Riqaq 1",
        text_ru: "Две милости, в отношении которых обмануты многие люди: здоровье и свободное время.",
        source_ru: "Бухари, Рикак 1",
        text_mk: "Има две благодати во кои многу луѓе се измамени: здравјето и слободното време.",
        source_mk: "Бухари, Рикак 1"
    },
    {
        type: "Ayet",
        text_tr: "Allah, sabredenlerle beraberdir.",
        source_tr: "Bakara, 153",
        text_en: "Indeed, Allah is with the patient.",
        source_en: "Al-Baqarah 2:153",
        text_de: "Wahrlich, Allah ist mit den Geduldigen.",
        source_de: "Al-Baqara 2:153",
        text_ru: "Воистину, Аллах — с терпеливыми.",
        source_ru: "Аль-Бакара 2:153",
        text_mk: "Навистина, Аллах е со трпеливите.",
        source_mk: "Бекара 2:153"
    },
    {
        type: "Hadis",
        text_tr: "Hayra vesile olan, hayrı yapan gibidir.",
        source_tr: "Tirmizi, İlim 14",
        text_en: "Whoever guides someone to goodness will have a reward like one who did it.",
        source_en: "Tirmidhi, Ilm 14",
        text_de: "Wer zum Guten anleitet, erhält den gleichen Lohn wie derjenige, der es tut.",
        source_de: "Tirmidhi, Ilm 14",
        text_ru: "Указавший на благое подобен совершившему его.",
        source_ru: "Тирмизи, Ильм 14",
        text_mk: "Оној што упатува на добро е како оној што го прави доброто.",
        source_mk: "Тирмизи, Илм 14"
    },
    {
        type: "Ayet",
        text_tr: "Nerede olursanız olun, O sizinle beraberdir.",
        source_tr: "Hadîd, 4",
        text_en: "And He is with you wherever you are.",
        source_en: "Al-Hadid 57:4",
        text_de: "Und Er ist mit euch, wo immer ihr seid.",
        source_de: "Al-Hadid 57:4",
        text_ru: "Он с вами, где бы вы ни были.",
        source_ru: "Аль-Хадид 57:4",
        text_mk: "И Тој е со вас каде и да сте.",
        source_mk: "Хадид 57:4"
    },
    {
        type: "Hadis",
        text_tr: "Müslüman, elinden ve dilinden insanların emin olduğu kişidir.",
        source_tr: "Buhari, İman 4",
        text_en: "A Muslim is the one from whose tongue and hands people are safe.",
        source_en: "Bukhari, Iman 4",
        text_de: "Ein Muslim ist derjenige, vor dessen Zunge und Hand die Menschen sicher sind.",
        source_de: "Buchari, Iman 4",
        text_ru: "Мусульманин — это тот, от чьего языка и рук защищены люди.",
        source_ru: "Бухари, Иман 4",
        text_mk: "Муслиман е оној од чиј јазик и рака луѓето се сигурни.",
        source_mk: "Бухари, Иман 4"
    },
    {
        type: "Ayet",
        text_tr: "Şüphesiz Allah adaleti, iyiliği ve akrabaya yardım etmeyi emreder.",
        source_tr: "Nahl, 90",
        text_en: "Indeed, Allah orders justice and good conduct and giving to relatives.",
        source_en: "An-Nahl 16:90",
        text_de: "Wahrlich, Allah gebietet Gerechtigkeit, gütiges Handeln und Zuwendung zu den Verwandten.",
        source_de: "An-Nahl 16:90",
        text_ru: "Воистину, Аллах повелевает справедливость, благодеяние и одаривание родственников.",
        source_ru: "Ан-Нахль 16:90",
        text_mk: "Навистина, Аллах наредува правда, добродетел и давање на роднините.",
        source_mk: "Нахл 16:90"
    },
    {
        type: "Hadis",
        text_tr: "Komşusu açken tok yatan bizden değildir.",
        source_tr: "Müslim, İman 74",
        text_en: "He is not one of us who sleeps with a full stomach while his neighbor is hungry.",
        source_en: "Bukhari Adab 112",
        text_de: "Derjenige gehört nicht zu uns, der satt zu Bett geht, während sein Nachbar hungert.",
        source_de: "Buchari Adab 112",
        text_ru: "Не относится к нам тот, кто засыпает сытым, зная, что его сосед голоден.",
        source_ru: "Бухари Адаб 112",
        text_mk: "Не е од нас оној што си легнува сит, додека неговиот сосед е гладен.",
        source_mk: "Бухари Адаб 112"
    },
    {
        type: "Ayet",
        text_tr: "Allah size bir hayır dilerse, onu engelleyecek hiçbir güç yoktur.",
        source_tr: "Yunus, 107",
        text_en: "If Allah intends for you any good, there is no repelling His bounty.",
        source_en: "Yunus 10:107",
        text_de: "Wenn Allah dir Gutes will, kann niemand Seine Huld abwenden.",
        source_de: "Yunus 10:107",
        text_ru: "Если Аллах желает тебе добра, то никто не отвратит Его милости.",
        source_ru: "Юнус 10:107",
        text_mk: "Ако Аллах ти сака некое добро, никој не може да ја спречи Неговата милост.",
        source_mk: "Јунус 10:107"
    },
    {
        type: "Hadis",
        text_tr: "Sizin en hayırlınız, ahlakı en güzel olanınızdır.",
        source_tr: "Buhari, Edeb 38",
        text_en: "The best of you are those with the best character and manners.",
        source_en: "Bukhari, Adab 38",
        text_de: "Die Besten unter euch sind diejenigen mit dem edelsten Charakter.",
        source_de: "Buchari, Adab 38",
        text_ru: "Лучшие из вас — те, у кого наилучший нрав.",
        source_ru: "Бухари, Адаб 38",
        text_mk: "Најдобри меѓу вас се оние со најубав морал и карактер.",
        source_mk: "Бухари, Едеб 38"
    },
    {
        type: "Ayet",
        text_tr: "Allah, hiç kimseye gücünün yettiğinden fazlasını yüklemez.",
        source_tr: "Bakara, 286",
        text_en: "Allah does not burden a soul beyond that it can bear.",
        source_en: "Al-Baqarah 2:286",
        text_de: "Allah bürdet keiner Seele mehr auf, als sie zu ertragen vermag.",
        source_de: "Al-Baqara 2:286",
        text_ru: "Аллах не возлагает на душу сверх ее возможностей.",
        source_ru: "Аль-Бакара 2:286",
        text_mk: "Аллах не оптоварува ниту една душа преку нејзините можности.",
        source_mk: "Бекара 2:286"
    }
];

function initQuoteWidget() {
    currentQuoteIndex = Math.floor(Math.random() * inspirationalQuotes.length);
    renderQuoteWidget();
}

function renderQuoteWidget() {
    const quote = inspirationalQuotes[currentQuoteIndex] || inspirationalQuotes[0];
    const lang = appSettings.language || 'tr';
    const t = i18n[lang] || i18n.tr;

    const titleStr = quote.type === 'Ayet' ? t.quote_verse : t.quote_hadith;
    const textStr = quote['text_' + lang] || quote.text_en || quote.text_tr;
    const sourceStr = quote['source_' + lang] || quote.source_en || quote.source_tr;

    const typeEl = document.getElementById('quote-type');
    const textEl = document.getElementById('quote-text');
    const sourceEl = document.getElementById('quote-source');

    if (typeEl) typeEl.textContent = titleStr;
    if (textEl) textEl.textContent = `"${textStr}"`;
    if (sourceEl) sourceEl.textContent = `— ${sourceStr}`;
}

// --- Media Controller ---
function initMediaController() {
    const widget = document.getElementById('media-widget');
    if (widget) {
        widget.style.display = 'none';
    }
}

async function triggerMediaAction(action) {
    // Media controls not active in pure web site mode
}

async function updateMediaStatus() {
    // Media status not queried in pure web site mode
}

function updatePlayPauseIcon(isPlaying) {
    const btn = document.getElementById('btn-media-play');
    if (isPlaying) {
        btn.innerHTML = `<svg id="svg-pause-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="4" width="4" height="16" fill="currentColor"/><rect x="6" y="4" width="4" height="16" fill="currentColor"/></svg>`;
    } else {
        btn.innerHTML = `<svg id="svg-play-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
    }
}

function applyTranslations() {
    const lang = appSettings.language || 'tr';
    const t = i18n[lang] || i18n.tr;

    // Set text direction (LTR since Arabic was removed)
    document.documentElement.dir = 'ltr';

    // Replace data-i18n tags
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                el.placeholder = t[key];
            } else if (el.tagName === 'OPTION') {
                el.textContent = t[key];
            } else {
                el.textContent = t[key];
            }
        }
    });

    // Sidebar titles
    const shortcutsTitle = document.getElementById('shortcuts-title-lbl');
    if (shortcutsTitle) shortcutsTitle.textContent = t.shortcuts;
    const weatherTitle = document.getElementById('weather-title-lbl');
    if (weatherTitle) weatherTitle.textContent = t.weather;
    const prayerTitle = document.getElementById('prayer-title-lbl');
    if (prayerTitle) prayerTitle.textContent = t.prayer;

    // Control bar titles
    const btnFocus = document.getElementById('btn-focus');
    if (btnFocus) btnFocus.title = t.focus_btn;
    const btnBoard = document.getElementById('btn-board');
    if (btnBoard) btnBoard.title = t.board_btn;
    const btnVoice = document.getElementById('btn-voice');
    if (btnVoice) btnVoice.title = t.voice_btn;
    const btnSettings = document.getElementById('btn-settings');
    if (btnSettings) btnSettings.title = t.settings_btn;
    const btnExit = document.getElementById('btn-exit');
    if (btnExit) btnExit.title = 'abdullahnil.com';
    const btnFsEl = document.getElementById('btn-fullscreen');
    if (btnFsEl) btnFsEl.title = t.fullscreen_btn || 'Fullscreen';

    // Whiteboard actions
    const btnPb = document.getElementById('btn-paint-back');
    if (btnPb) btnPb.title = t.lbl_tb_back;
    const btnPt = document.getElementById('btn-paint-text');
    if (btnPt) btnPt.title = t.lbl_tb_text;
    const btnPe = document.getElementById('btn-paint-eraser');
    if (btnPe) btnPe.title = t.lbl_tb_eraser;
    const btnPu = document.getElementById('btn-paint-undo');
    if (btnPu) btnPu.title = t.lbl_tb_undo;
    const btnPc = document.getElementById('btn-paint-clear');
    if (btnPc) btnPc.title = t.lbl_tb_clear;
    const btnPs = document.getElementById('btn-paint-save');
    if (btnPs) btnPs.title = t.lbl_tb_save;

    // Settings navigation links
    const tabGen = document.querySelector('[data-tab="tab-general"]');
    if (tabGen) tabGen.textContent = t.tab_general;
    const tabWid = document.querySelector('[data-tab="tab-widgets"]');
    if (tabWid) tabWid.textContent = t.tab_widgets;
    const tabSho = document.querySelector('[data-tab="tab-shortcuts"]');
    if (tabSho) tabSho.textContent = t.tab_shortcuts;
    const tabCal = document.querySelector('[data-tab="tab-calendar"]');
    if (tabCal) tabCal.textContent = t.tab_calendar;
    const tabAi = document.querySelector('[data-tab="tab-ai"]');
    if (tabAi) tabAi.textContent = t.tab_ai;

    // Focus info
    const focusInst = document.querySelector('.focus-instructions');
    if (focusInst) focusInst.textContent = t.focus_exit_info;

    // Calendar weekdays header localization (Monday to Sunday)
    const weekdaysEl = document.querySelector('.calendar-weekdays');
    if (weekdaysEl) {
        if (lang === 'en') {
            weekdaysEl.innerHTML = '<span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>';
        } else if (lang === 'de') {
            weekdaysEl.innerHTML = '<span>Mo</span><span>Di</span><span>Mi</span><span>Do</span><span>Fr</span><span>Sa</span><span>So</span>';
        } else if (lang === 'ru') {
            weekdaysEl.innerHTML = '<span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span>';
        } else if (lang === 'mk') {
            weekdaysEl.innerHTML = '<span>По</span><span>Вт</span><span>Ср</span><span>Че</span><span>Пе</span><span>Са</span><span>Не</span>';
        } else {
            weekdaysEl.innerHTML = '<span>Pt</span><span>Sa</span><span>Ça</span><span>Pe</span><span>Cu</span><span>Ct</span><span>Pz</span>';
        }
    }

    // Refresh quote display with current language
    renderQuoteWidget();

    // Refresh calendar month and events if already rendered
    renderCalendarGrid();
    renderUpcomingEvents();

    // Refresh search engine placeholder
    setSearchEngine(appSettings.search_engine || 'google');

    // Refresh presets display
    renderBackgroundPresets();

    // Refresh prayer times countdown if available
    if (loadedPrayers) {
        updateActivePrayerTime(loadedPrayers);
    }
}

function renderForecastModal(data) {
    if (!data) return;
    const lang = appSettings.language || 'tr';
    const t = i18n[lang] || i18n.tr;
    const localeMap = { tr: 'tr-TR', en: 'en-US', de: 'de-DE', ru: 'ru-RU', mk: 'mk-MK' };
    const locale = localeMap[lang] || 'tr-TR';

    // General titles
    document.getElementById('forecast-modal-title').textContent = `${t.lbl_weather_forecast} (${appSettings.weather_city || 'Istanbul'})`;
    document.getElementById('forecast-hourly-title').textContent = t.lbl_hourly;
    document.getElementById('forecast-daily-title').textContent = t.lbl_daily;
    document.getElementById('forecast-city-input').placeholder = t.lbl_weather_city;
    document.getElementById('btn-forecast-search').textContent = t.lbl_weather_search.split(' ')[0]; // "Ara" / "Search"
    document.getElementById('btn-forecast-gps').textContent = t.lbl_gps_auto;

    // Render Hourly predictions (next 24 hours starting now)
    const hourlyList = document.getElementById('forecast-hourly-list');
    hourlyList.innerHTML = '';
    const nowHour = new Date().getHours();

    for (let i = nowHour; i < nowHour + 24 && i < data.hourly.time.length; i++) {
        const timeStr = data.hourly.time[i];
        const date = new Date(timeStr);
        const hourFormatted = String(date.getHours()).padStart(2, '0') + ':00';
        const temp = Math.round(data.hourly.temperature_2m[i]);
        const code = data.hourly.weather_code[i];
        const wInfo = getWeatherCodeDetails(code);

        const card = document.createElement('div');
        card.className = 'forecast-hour-card';
        card.innerHTML = `
            <span class="hour-time">${hourFormatted}</span>
            <span class="hour-icon" title="${wInfo.desc}">${wInfo.icon}</span>
            <span class="hour-temp">${temp}°C</span>
        `;
        hourlyList.appendChild(card);
    }

    // Render Daily forecast (next 7 days)
    const dailyList = document.getElementById('forecast-daily-list');
    dailyList.innerHTML = '';

    for (let i = 0; i < 7 && i < data.daily.time.length; i++) {
        const timeStr = data.daily.time[i];
        const date = new Date(timeStr);
        let dayName = date.toLocaleDateString(locale, { weekday: 'long' });
        dayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
        if (i === 0) dayName = t.lbl_today || "Bugün";

        const maxTemp = Math.round(data.daily.temperature_2m_max[i]);
        const minTemp = Math.round(data.daily.temperature_2m_min[i]);
        const code = data.daily.weather_code[i];
        const wInfo = getWeatherCodeDetails(code);

        const row = document.createElement('div');
        row.className = 'forecast-day-row';
        row.innerHTML = `
            <span class="day-name">${dayName}</span>
            <span class="day-icon" title="${wInfo.desc}">${wInfo.icon}</span>
            <div class="day-temp-range">
                <strong>${maxTemp}°C</strong>
                <span>${minTemp}°C</span>
            </div>
        `;
        dailyList.appendChild(row);
    }
}

function requestGeolocationAndSave(feedbackElId) {
    const feedbackEl = feedbackElId ? document.getElementById(feedbackElId) : null;
    const lang = appSettings.language || 'tr';
    const t = i18n[lang] || i18n.tr;

    if (feedbackEl) feedbackEl.textContent = t.gps_searching;

    if (!navigator.geolocation) {
        if (feedbackEl) feedbackEl.textContent = t.gps_not_supported;
        return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        if (feedbackEl) feedbackEl.textContent = t.gps_resolving;

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=${lang}`);
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.village || data.address.province || (lang === 'en' ? "Location" : "Konum");

            appSettings.weather_city = city;
            appSettings.weather_lat = lat;
            appSettings.weather_lon = lon;

            if (feedbackEl) feedbackEl.textContent = `${t.gps_located}: ${city}`;

            // Save settings locally/remotely
            await saveSettingsQuietly();
            initWeather();
            initPrayerTimes();
        } catch (e) {
            // Fallback to raw coords
            appSettings.weather_city = `GPS (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
            appSettings.weather_lat = lat;
            appSettings.weather_lon = lon;
            if (feedbackEl) feedbackEl.textContent = t.gps_coord_saved;
            await saveSettingsQuietly();
            initWeather();
            initPrayerTimes();
        }
    }, (err) => {
        if (feedbackEl) feedbackEl.textContent = `${t.gps_denied}: ${err.message}`;
    });
}

// --- Shortcuts ---
function getShortcutIconHtml(item) {
    if (item.url && (item.url.startsWith('http://') || item.url.startsWith('https://'))) {
        try {
            const domain = new URL(item.url).hostname;
            const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
            return `<img class="shortcut-tile-icon-img" src="${faviconUrl}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><span class="shortcut-tile-icon-emoji" style="display:none;">🌐</span>`;
        } catch (e) {
            return `<span class="shortcut-tile-icon-emoji">🌐</span>`;
        }
    }
    const icon = item.icon || '🌐';
    if (icon.startsWith('http') || icon.startsWith('/') || icon.length > 4) {
        return `<img class="shortcut-tile-icon-img" src="${icon}">`;
    }
    return `<span class="shortcut-tile-icon-emoji">${icon}</span>`;
}

function initShortcuts() {
    const listEl = document.getElementById('shortcut-items');
    listEl.innerHTML = '';

    const list = appSettings.shortcuts || [];
    list.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'shortcut-item-tile';
        itemEl.innerHTML = `
            ${getShortcutIconHtml(item)}
            <span class="shortcut-tile-label">${item.name}</span>
        `;
        itemEl.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid exit event trigger
            if (item.url.startsWith('http://') || item.url.startsWith('https://')) {
                window.open(item.url, '_blank');
            } else {
                const lang = appSettings.language || 'tr';
                const t = i18n[lang] || i18n.tr;
                alert(t.local_app_warning);
            }
        });
        listEl.appendChild(itemEl);
    });
}

// --- Calendar Widget ---
async function initCalendar() {
    // Web mode: combine local events + uploaded web events
    calendarEvents = [...(appSettings.calendar_local_events || [])];
    const storedWebEvents = localStorage.getItem('niltab_web_events') || localStorage.getItem('nilsaver_web_events');
    if (storedWebEvents) {
        try {
            const parsed = JSON.parse(storedWebEvents);
            calendarEvents.push(...parsed);
        } catch (e) { }
    }
    const uploadBtn = document.getElementById('btn-upload-ics-web');
    if (uploadBtn) uploadBtn.style.display = 'inline-block';

    // Fetch and sync URLs in calendar_sync_ics using corsproxy.io to bypass CORS issues on a static site
    const syncUrls = appSettings.calendar_sync_ics || [];
    for (const url of syncUrls) {
        if (url && url.trim().startsWith('http')) {
            try {
                // Use corsproxy.io as a reliable public CORS bypass proxy
                const proxiedUrl = `https://corsproxy.io/?${encodeURIComponent(url.trim())}`;
                const response = await fetch(proxiedUrl);
                if (response.ok) {
                    const text = await response.text();
                    const urlEvents = parseIcsContentJS(text, new URL(url).hostname);
                    if (urlEvents && urlEvents.length > 0) {
                        calendarEvents.push(...urlEvents);
                    }
                }
            } catch (err) {
                console.warn(`Failed to fetch ICS feed from: ${url}`, err);
            }
        }
    }

    renderCalendarGrid();
    renderUpcomingEvents();
}

function renderCalendarGrid() {
    const now = new Date();
    const todayDate = now.getDate();
    const todayMonth = now.getMonth(); // 0-indexed
    const todayYear = now.getFullYear();

    const lang = appSettings.language || 'tr';
    const localeMap = { tr: 'tr-TR', en: 'en-US', de: 'de-DE', ru: 'ru-RU', mk: 'mk-MK' };
    const locale = localeMap[lang] || 'tr-TR';
    const monthDate = new Date(displayedYear, displayedMonth, 1);
    let monthName = monthDate.toLocaleDateString(locale, { month: 'long' });
    monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    document.getElementById('calendar-month-name').textContent = `${monthName} ${displayedYear}`;

    const daysEl = document.getElementById('calendar-days');
    daysEl.innerHTML = '';

    // First day of displayed month (Sunday is 0, let's map to Monday start)
    let firstDayIdx = new Date(displayedYear, displayedMonth, 1).getDay();
    // In JS, Sunday=0, Monday=1... We want Monday start, so shift index:
    // Sunday (0) -> 6, Monday (1) -> 0...
    firstDayIdx = firstDayIdx === 0 ? 6 : firstDayIdx - 1;

    // Previous month padding days
    const prevMonthDaysCount = new Date(displayedYear, displayedMonth, 0).getDate();
    for (let i = firstDayIdx - 1; i >= 0; i--) {
        const cell = document.createElement('span');
        cell.className = 'calendar-day-cell other-month';
        cell.textContent = prevMonthDaysCount - i;
        daysEl.appendChild(cell);
    }

    // Current month days
    const currentMonthDaysCount = new Date(displayedYear, displayedMonth + 1, 0).getDate();

    for (let i = 1; i <= currentMonthDaysCount; i++) {
        const cell = document.createElement('span');
        cell.className = 'calendar-day-cell';
        cell.textContent = i;

        // Check if today
        if (i === todayDate && displayedMonth === todayMonth && displayedYear === todayYear) {
            cell.classList.add('today');
        }

        // Check if there are events on this day
        const dayStr = `${displayedYear}-${String(displayedMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const hasEvent = calendarEvents.some(e => e.start.startsWith(dayStr));
        if (hasEvent) {
            cell.classList.add('has-events');
        }

        daysEl.appendChild(cell);
    }

    // Next month padding days to fill 42 cells (6 rows * 7 days)
    const filledCells = firstDayIdx + currentMonthDaysCount;
    const remaining = 42 - filledCells;
    for (let i = 1; i <= remaining; i++) {
        const cell = document.createElement('span');
        cell.className = 'calendar-day-cell other-month';
        cell.textContent = i;
        daysEl.appendChild(cell);
    }
}

function renderUpcomingEvents() {
    const listEl = document.getElementById('calendar-events-list');
    listEl.innerHTML = '';

    const lang = appSettings.language || 'tr';
    const t = i18n[lang] || i18n.tr;
    const localeMap = { tr: 'tr-TR', en: 'en-US', de: 'de-DE', ru: 'ru-RU', mk: 'mk-MK' };
    const locale = localeMap[lang] || 'tr-TR';

    const now = new Date();

    // Sort events by date
    const sorted = calendarEvents.filter(e => {
        if (!e.start) return false;
        // Keep upcoming or today's events
        const startD = new Date(e.start);
        return startD >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }).sort((a, b) => new Date(a.start) - new Date(b.start));

    if (sorted.length === 0) {
        listEl.innerHTML = `<div style="font-size: 0.75rem; color: var(--color-text-dim); text-align: center; padding: 10px;">${t.no_events}</div>`;
        return;
    }

    // Display top 5 events
    sorted.slice(0, 5).forEach(e => {
        const item = document.createElement('div');
        item.className = 'event-item';

        const eventDate = new Date(e.start);
        const timeStr = eventDate.toLocaleDateString(locale, { day: 'numeric', month: 'short' }) + ' ' +
            eventDate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

        item.innerHTML = `
            <div class="event-item-summary">${e.summary}</div>
            <div class="event-item-time">${timeStr} <span style="color:var(--color-accent)">(${e.source})</span></div>
        `;
        listEl.appendChild(item);
    });
}

// --- Screensaver Exit Rules ---
function setupScreensaverExitRules() {
    let startX = null;
    let startY = null;
    const threshold = 25; // Minimum px distance to consider it a mouse movement exit

    // Handle mouse move
    document.addEventListener('mousemove', (e) => {
        // If we are in interactive mode, do nothing on mouse move
        if (appSettings.mode !== 'traditional') return;
        // Ignore if focus overlay is hidden, or if settings are open, or if canvas is active
        if (isUiOverlayActive()) return;

        if (startX === null || startY === null) {
            startX = e.clientX;
            startY = e.clientY;
            return;
        }

        const dx = Math.abs(e.clientX - startX);
        const dy = Math.abs(e.clientY - startY);

        if (dx > threshold || dy > threshold) {
            exitScreensaver();
        }
    });

    // Handle click
    document.addEventListener('click', (e) => {
        if (appSettings.mode !== 'traditional') return;
        if (isUiOverlayActive()) return;

        // Prevent immediate exit when clicking control buttons
        if (e.target.closest('#control-bar') || e.target.closest('.widget-card') || e.target.closest('#shortcuts-widget')) return;

        exitScreensaver();
    });

    // Handle keyboard escape and F11 Fullscreen
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F11') {
            e.preventDefault();
            toggleAppFullscreen();
            return;
        }

        if (e.key === 'Escape') {
            exitScreensaver();
        }

        // If traditional mode, any key exits
        if (appSettings.mode === 'traditional' && !isUiOverlayActive()) {
            exitScreensaver();
        }
    });
}

function isUiOverlayActive() {
    return !document.getElementById('settings-overlay').classList.contains('hidden') ||
        !document.getElementById('whiteboard-overlay').classList.contains('hidden') ||
        !document.getElementById('voice-overlay').classList.contains('hidden') ||
        !document.getElementById('shortcut-dialog').classList.contains('hidden') ||
        !document.getElementById('event-dialog').classList.contains('hidden');
}

// --- Voice Assistant ---
function startVoiceAssistant() {
    const overlay = document.getElementById('voice-overlay');
    const speechText = document.getElementById('voice-transcription');
    const responseText = document.getElementById('voice-response');
    const statusText = document.getElementById('voice-status');

    overlay.classList.remove('hidden');
    speechText.textContent = '';
    responseText.textContent = '';
    statusText.textContent = 'Dinliyorum...';

    // Start wave animation
    initVoiceWaveCanvas();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        statusText.textContent = 'Desteklenmiyor';
        responseText.textContent = 'Hata: Tarayıcınız ses tanımayı desteklemiyor.';
        return;
    }

    recognition = new SpeechRecognition();
    const lang = appSettings.language || 'tr';
    const langVoiceMap = { tr: 'tr-TR', en: 'en-US', de: 'de-DE', ru: 'ru-RU', mk: 'mk-MK' };
    recognition.lang = langVoiceMap[lang] || 'tr-TR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        isListening = true;
    };

    recognition.onresult = async (event) => {
        const text = event.results[0][0].transcript;
        speechText.textContent = `"${text}"`;
        statusText.textContent = 'Yorumlanıyor...';
        await handleVoiceCommand(text);
    };

    recognition.onerror = (e) => {
        console.error("Speech recognition error:", e);
        stopVoiceWaveCanvas();
        
        if (e.error === 'not-allowed') {
            statusText.textContent = 'İzin Verilmedi';
            if (window.location.protocol === 'file:') {
                responseText.textContent = 'Hata: Tarayıcılar güvenlik nedeniyle yerel dosyalarda (file://) ses tanımaya izin vermez. Lütfen NilTab\'ı yerel bir sunucu (localhost) üzerinden çalıştırın veya web üzerinde (HTTPS) barındırın.';
            } else {
                responseText.textContent = 'Hata: Mikrofon erişim izni reddedildi. Lütfen tarayıcı adres satırındaki kilit simgesine tıklayarak mikrofon izni verin.';
            }
        } else if (e.error === 'network') {
            statusText.textContent = 'Bağlantı Hatası';
            responseText.textContent = 'Hata: Ses tanıma servisiyle internet bağlantısı kurulamadı. Lütfen internetinizi kontrol edin.';
        } else {
            statusText.textContent = 'Duyulamadı';
            responseText.textContent = `Ses tanıma hatası: ${e.error || 'Duyulamadı'}. Lütfen tekrar deneyin.`;
        }
    };

    recognition.onend = () => {
        isListening = false;
        stopVoiceWaveCanvas();
    };

    try {
        recognition.start();
    } catch (err) {
        console.error("Speech recognition start failed:", err);
        statusText.textContent = 'Başlatılamadı';
        responseText.textContent = 'Hata: Ses tanıma servisi başlatılamadı. Lütfen mikrofonunuzu kontrol edin.';
        stopVoiceWaveCanvas();
    }
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop current speak
        const utterance = new SpeechSynthesisUtterance(text);
        const lang = appSettings.language || 'tr';
        const langVoiceMap = { tr: 'tr-TR', en: 'en-US', de: 'de-DE', ru: 'ru-RU', mk: 'mk-MK' };
        utterance.lang = langVoiceMap[lang] || 'tr-TR';
        window.speechSynthesis.speak(utterance);
    }
}

async function fetchGeminiResponse(prompt) {
    const key = appSettings.gemini_api_key;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: {
                parts: [{ text: "Sen NilTab adında yardımcı bir yapay zeka ekran koruyucu asistanısın. Türkçe konuşacaksın. Cevapların kısa ve öz (en fazla 2-3 cümle) olsun çünkü sesli okunacaklar." }]
            }
        })
    });
    if (!response.ok) throw new Error("Gemini API call failed");
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

async function handleVoiceCommand(text) {
    const responseText = document.getElementById('voice-response');
    const statusText = document.getElementById('voice-status');
    const command = text.toLowerCase().trim();

    // Local Commands Matcher
    if (command.includes('saati aç') || command.includes('saati göster')) {
        appSettings.focus_clock_enabled = true;
        responseText.textContent = 'Saat odak modunda gösterilecek.';
        speakText(responseText.textContent);
        statusText.textContent = 'Tamamlandı';
    }
    else if (command.includes('saati kapat') || command.includes('saati gizle')) {
        appSettings.focus_clock_enabled = false;
        responseText.textContent = 'Saat odak modunda gizlendi.';
        speakText(responseText.textContent);
        statusText.textContent = 'Tamamlandı';
    }
    else if (command.includes('hava durumu')) {
        const temp = document.getElementById('weather-temp').textContent;
        const desc = document.getElementById('weather-desc').textContent;
        responseText.textContent = `Bugün hava ${appSettings.weather_city}'da ${temp} ve ${desc}.`;
        speakText(responseText.textContent);
        statusText.textContent = 'Tamamlandı';
    }
    else if (command.includes('namaz vakti') || command.includes('namaz vakitleri')) {
        const nextInfo = document.getElementById('prayer-next').textContent;
        responseText.textContent = `Namaz vakitleri: ${nextInfo}.`;
        speakText(responseText.textContent);
        statusText.textContent = 'Tamamlandı';
    }
    else if (command.includes('odak modu') || command.includes('odağı aç') || command.includes('ekranı karart')) {
        responseText.textContent = 'Odak moduna geçiliyor.';
        speakText(responseText.textContent);
        statusText.textContent = 'Tamamlandı';
        setTimeout(() => {
            document.getElementById('voice-overlay').classList.add('hidden');
            toggleFocusMode(true);
        }, 1500);
    }
    else if (command.includes('tahta modu') || command.includes('tahtayı aç') || command.includes('çizim aç')) {
        responseText.textContent = 'Çizim tahtası açılıyor.';
        speakText(responseText.textContent);
        statusText.textContent = 'Tamamlandı';
        setTimeout(() => {
            document.getElementById('voice-overlay').classList.add('hidden');
            toggleWhiteboard(true);
        }, 1500);
    }
    else if (command.includes('kapat') || command.includes('çıkış yap') || command.includes('çık')) {
        responseText.textContent = 'Görüşmek üzere.';
        speakText(responseText.textContent);
        statusText.textContent = 'Kapatılıyor';
        setTimeout(() => {
            exitScreensaver();
        }, 1500);
    }
    else if (command.includes('ayarlar') || command.includes('ayarları aç')) {
        responseText.textContent = 'Ayarlar menüsü açılıyor.';
        speakText(responseText.textContent);
        statusText.textContent = 'Tamamlandı';
        setTimeout(() => {
            document.getElementById('voice-overlay').classList.add('hidden');
            openSettingsModal();
        }, 1500);
    }
    else {
        // Fallback: Use Gemini AI API if Key exists
        if (appSettings.gemini_api_key) {
            statusText.textContent = 'Yapay Zekaya Soruluyor...';
            try {
                const response = await fetchGeminiResponse(text);
                responseText.textContent = response;
                speakText(response);
                statusText.textContent = 'AI Yanıtı';
            } catch (e) {
                console.error("Gemini API error:", e);
                responseText.textContent = 'Yapay zeka yanıt veremedi, lütfen bağlantınızı kontrol edin.';
                speakText(responseText.textContent);
                statusText.textContent = 'Hata';
            }
        } else {
            responseText.textContent = 'Komut anlaşılamadı. Genel sorular için ayarlardan bir Gemini API Key ekleyin.';
            speakText(responseText.textContent);
            statusText.textContent = 'Komut Yok';
        }
    }
}

function exitScreensaver() {
    window.location.href = "https://abdullahnil.com";
}

function toggleAppFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error enabling full-screen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// --- Focus Mode ---
function toggleFocusMode(enable) {
    const focusOverlay = document.getElementById('focus-overlay');
    const focusClock = document.getElementById('focus-clock');

    if (enable) {
        focusOverlay.classList.remove('hidden');
        if (appSettings.focus_clock_enabled) {
            focusClock.classList.remove('hidden');
        } else {
            focusClock.classList.add('hidden');
        }
    } else {
        focusOverlay.classList.add('hidden');
    }
}

// --- Whiteboard Mode (Tahta Modu) ---
function toggleWhiteboard(enable) {
    const overlay = document.getElementById('whiteboard-overlay');
    canvas = document.getElementById('paint-canvas');
    ctx = canvas.getContext('2d');

    if (enable) {
        overlay.classList.remove('hidden');

        // Resize canvas to full screen
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Whiteboard background color
        ctx.fillStyle = "#111116";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        setupPaintCanvasListeners();

        // Reset histories
        drawingHistory = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
        drawingRedoHistory = [];

        // Reset text tools
        isTextTool = false;
        const textBtn = document.getElementById('btn-paint-text');
        if (textBtn) textBtn.classList.remove('active');
        const textInput = document.getElementById('canvas-text-input');
        if (textInput) textInput.classList.add('hidden');
    } else {
        overlay.classList.add('hidden');
        const textInput = document.getElementById('canvas-text-input');
        if (textInput) textInput.classList.add('hidden');
    }
}

function setupPaintCanvasListeners() {
    // Desktop listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDrawing);

    // Mobile/Touch listeners
    canvas.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        startDrawing({ clientX: touch.clientX, clientY: touch.clientY });
    });
    canvas.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        draw({ clientX: touch.clientX, clientY: touch.clientY });
        e.preventDefault(); // Stop scrolling
    });
    window.addEventListener('touchend', stopDrawing);
}

function startDrawing(e) {
    if (isTextTool) {
        // If text input is already visible and has value, commit it before starting a new one
        const inputEl = document.getElementById('canvas-text-input');
        if (!inputEl.classList.contains('hidden')) {
            commitCanvasText();
        }

        textX = e.clientX;
        textY = e.clientY;

        inputEl.style.left = `${textX}px`;
        inputEl.style.top = `${textY}px`;
        inputEl.value = '';
        inputEl.classList.remove('hidden');
        setTimeout(() => inputEl.focus(), 50);
        return;
    }
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY);
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = isEraser ? "#111116" : brushColor;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
}

function commitCanvasText() {
    const inputEl = document.getElementById('canvas-text-input');
    const textVal = inputEl.value.trim();
    if (textVal) {
        ctx.font = `${parseInt(brushSize) * 2 + 16}px ${getComputedStyle(document.body).fontFamily || 'Outfit'}`;
        ctx.fillStyle = brushColor;
        ctx.textBaseline = 'top';
        ctx.fillText(textVal, textX, textY);

        // Save state for undo
        drawingHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        if (drawingHistory.length > 20) drawingHistory.shift();
        drawingRedoHistory = [];
    }
    inputEl.value = '';
    inputEl.classList.add('hidden');
}

function draw(e) {
    if (!drawing) return;
    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();
}

function stopDrawing() {
    if (!drawing) return;
    drawing = false;

    // Save state for undo
    drawingHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (drawingHistory.length > 20) drawingHistory.shift(); // Max 20 history states
    drawingRedoHistory = []; // Clear redo
}

function undoDrawing() {
    if (drawingHistory.length > 1) {
        const curState = drawingHistory.pop();
        drawingRedoHistory.push(curState);
        const prevState = drawingHistory[drawingHistory.length - 1];
        ctx.putImageData(prevState, 0, 0);
    }
}

// Voice Wave Animation on Canvas
function initVoiceWaveCanvas() {
    const canvas = document.getElementById('voice-wave');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    let phase = 0;

    function drawWave() {
        if (!isListening) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#54a0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();

        // Draw standard dynamic wave
        for (let x = 0; x < canvas.width; x++) {
            const amplitude = 18 * Math.sin(x * 0.03 + phase);
            const y = canvas.height / 2 + amplitude * Math.sin(x * 0.005);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Second wave overlay
        ctx.strokeStyle = 'rgba(84, 160, 255, 0.4)';
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
            const amplitude = 12 * Math.sin(x * 0.02 - phase * 1.5);
            const y = canvas.height / 2 + amplitude * Math.cos(x * 0.007);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        phase += 0.15;
        waveAnimationId = requestAnimationFrame(drawWave);
    }

    isListening = true;
    drawWave();
}

function stopVoiceWaveCanvas() {
    isListening = false;
    cancelAnimationFrame(waveAnimationId);
    const canvas = document.getElementById('voice-wave');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// --- Background Presets ---
const backgroundPresets = [
    { name_tr: "Uzay Boşluğu (Video)", name_en: "Outer Space (Video)", name_de: "Weltraum (Video)", name_ru: "Космос (Видео)", name_mk: "Вселена (Видео)", type: "video", path: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4" },
    { name_tr: "Samanyolu (Video)", name_en: "Milky Way (Video)", name_de: "Milchstraße (Video)", name_ru: "Млечный Путь (Видео)", name_mk: "Млечен Пат (Видео)", type: "video", path: "https://assets.mixkit.co/videos/preview/mixkit-mysterious-pale-blue-galaxy-41662-large.mp4" },
    { name_tr: "Sisli Dağ (Resim)", name_en: "Misty Mountain (Image)", name_de: "Nebeliger Berg (Bild)", name_ru: "Туманная гора (Фото)", name_mk: "Маглива Планина (Слика)", type: "image", path: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80" },
    { name_tr: "Doğa & Orman (Resim)", name_en: "Nature & Forest (Image)", name_de: "Natur & Wald (Bild)", name_ru: "Природа и лес (Фото)", name_mk: "Природа и Шума (Слика)", type: "image", path: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80" },
    { name_tr: "Yeşil Vadi (Resim)", name_en: "Green Valley (Image)", name_de: "Grünes Tal (Bild)", name_ru: "Зеленая долина (Фото)", name_mk: "Зелена Долина (Слика)", type: "image", path: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80" },
    { name_tr: "Karlı Zirve (Resim)", name_en: "Snowy Peak (Image)", name_de: "Schneegipfel (Bild)", name_ru: "Снежная вершина (Фото)", name_mk: "Снежен Врв (Слика)", type: "image", path: "https://images.unsplash.com/photo-1486873249359-2731bd6dafc7?auto=format&fit=crop&w=1200&q=80" },
    { name_tr: "Tropikal Sahil (Resim)", name_en: "Tropical Beach (Image)", name_de: "Tropischer Strand (Bild)", name_ru: "Тропический пляж (Фото)", name_mk: "Тропска Плажа (Слика)", type: "image", path: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80" },
    { name_tr: "Kuzey Işıkları (Resim)", name_en: "Northern Lights (Image)", name_de: "Nordlichter (Bild)", name_ru: "Северное сияние (Фото)", name_mk: "Поларна Светлина (Слика)", type: "image", path: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1200&q=80" },
    { name_tr: "Sessiz Göl (Resim)", name_en: "Calm Lake (Image)", name_de: "Stiller See (Bild)", name_ru: "Тихое озеро (Фото)", name_mk: "Мирно Езеро (Слика)", type: "image", path: "https://images.unsplash.com/photo-1439853949127-fa647821ebb0?auto=format&fit=crop&w=1200&q=80" },
    { name_tr: "Gece Gökyüzü (Resim)", name_en: "Starry Night (Image)", name_de: "Sternenhimmel (Bild)", name_ru: "Звездное небо (Фото)", name_mk: "Ѕвездено Небо (Слика)", type: "image", path: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1200&q=80" },
    { name_tr: "Renk Geçişi (Gradient)", name_en: "Dynamic Gradient", name_de: "Dynamischer Farbverlauf", name_ru: "Динамический градиент", name_mk: "Динамичен градиент", type: "gradient", path: "" }
];

function renderBackgroundPresets() {
    const container = document.getElementById('bg-presets-container');
    if (!container) return;
    container.innerHTML = '';
    const lang = appSettings.language || 'tr';

    backgroundPresets.forEach(preset => {
        const tile = document.createElement('div');
        tile.className = 'preset-tile';

        let displayName = preset.name_tr;
        if (lang === 'en') displayName = preset.name_en;
        else if (lang === 'de') displayName = preset.name_de;
        else if (lang === 'ru') displayName = preset.name_ru;
        else if (lang === 'mk') displayName = preset.name_mk;

        tile.textContent = displayName;

        // Active check
        const isCurrentType = appSettings.background_type === preset.type;
        const isCurrentPath = appSettings.background_path === preset.path;
        if (isCurrentType && (preset.type === 'gradient' || isCurrentPath)) {
            tile.classList.add('active');
        }

        tile.addEventListener('click', () => {
            document.querySelectorAll('.preset-tile').forEach(t => t.classList.remove('active'));
            tile.classList.add('active');

            // Set inputs
            document.getElementById('setting-bg-type').value = preset.type;
            document.getElementById('setting-bg-path').value = preset.path;

            // Update appSettings in memory immediately
            appSettings.background_type = preset.type;
            appSettings.background_path = preset.path;

            // Trigger select change handler to show/hide file selector
            const event = new Event('change');
            document.getElementById('setting-bg-type').dispatchEvent(event);
        });

        container.appendChild(tile);
    });
}

// --- Settings Controller ---
function openSettingsModal() {
    document.getElementById('settings-overlay').classList.remove('hidden');

    // Fill Settings Input Fields
    document.getElementById('setting-lang').value = appSettings.language || 'tr';
    document.getElementById('setting-mode').value = appSettings.mode || 'interactive';
    document.getElementById('setting-focus-clock').checked = appSettings.focus_clock_enabled;
    document.getElementById('setting-bg-type').value = appSettings.background_type || 'gradient';
    document.getElementById('setting-bg-path').value = appSettings.background_path || '';

    document.getElementById('setting-bg-blur').value = appSettings.background_blur || 0;
    document.getElementById('bg-blur-val').textContent = `${appSettings.background_blur || 0}px`;

    document.getElementById('setting-bg-brightness').value = appSettings.background_brightness !== undefined ? appSettings.background_brightness : 70;
    document.getElementById('bg-brightness-val').textContent = `${appSettings.background_brightness !== undefined ? appSettings.background_brightness : 70}%`;

    document.getElementById('setting-weather-enabled').checked = appSettings.weather_enabled;
    document.getElementById('setting-weather-city').value = appSettings.weather_city || '';
    document.getElementById('setting-prayer-enabled').checked = appSettings.prayer_enabled;
    const source = appSettings.prayer_source || 'diyanet';
    document.getElementById('setting-prayer-source').value = source;
    document.getElementById('setting-prayer-method').value = appSettings.prayer_method || 13;
    togglePrayerSourceUI(source);
    initSettingsPrayerDropdowns();

    document.getElementById('setting-gemini-key').value = appSettings.gemini_api_key || '';

    renderSettingsShortcutsTable();
    renderSettingsIcsList();
    renderBackgroundPresets();
}

function renderSettingsShortcutsTable() {
    const list = appSettings.shortcuts || [];
    const tbody = document.getElementById('shortcuts-edit-list');
    tbody.innerHTML = '';

    list.forEach((item, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" class="icon-input" value="${item.icon}" data-idx="${idx}" data-field="icon"></td>
            <td><input type="text" class="name-input" value="${item.name}" data-idx="${idx}" data-field="name"></td>
            <td><input type="text" class="path-input" value="${item.url}" data-idx="${idx}" data-field="url"></td>
            <td><button class="delete-row-btn" data-idx="${idx}">🗑️</button></td>
        `;
        tbody.appendChild(tr);
    });

    // Listen to changes in cells
    tbody.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = e.target.getAttribute('data-idx');
            const field = e.target.getAttribute('data-field');
            appSettings.shortcuts[idx][field] = e.target.value;
        });
    });

    // Listen to delete row
    tbody.querySelectorAll('.delete-row-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = e.target.getAttribute('data-idx');
            appSettings.shortcuts.splice(idx, 1);
            renderSettingsShortcutsTable();
        });
    });
}

function renderSettingsIcsList() {
    const sources = appSettings.calendar_sync_ics || [];
    const container = document.getElementById('ics-sources-container');
    container.innerHTML = '';

    sources.forEach((src, idx) => {
        const row = document.createElement('div');
        row.className = 'ics-source-row';
        row.innerHTML = `
            <input type="text" value="${src}" placeholder="ICS dosya yolu veya web linki" data-idx="${idx}">
            <button class="delete-row-btn" data-idx="${idx}">🗑️</button>
        `;
        container.appendChild(row);
    });

    // Listen to inputs
    container.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = e.target.getAttribute('data-idx');
            appSettings.calendar_sync_ics[idx] = e.target.value;
        });
    });

    // Listen to delete
    container.querySelectorAll('.delete-row-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = e.target.getAttribute('data-idx');
            appSettings.calendar_sync_ics.splice(idx, 1);
            renderSettingsIcsList();
        });
    });
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    // Navigation Panel Clicks
    document.getElementById('btn-focus').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFocusMode(true);
    });

    document.getElementById('btn-board').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleWhiteboard(true);
    });

    document.getElementById('btn-voice').addEventListener('click', (e) => {
        e.stopPropagation();
        startVoiceAssistant();
    });

    document.getElementById('btn-settings').addEventListener('click', (e) => {
        e.stopPropagation();
        openSettingsModal();
    });

    // btn-exit is now an <a> link to abdullahnil.com.
    const btnExitEl = document.getElementById('btn-exit');
    if (btnExitEl) {
        btnExitEl.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Fullscreen button
    const btnFs = document.getElementById('btn-fullscreen');
    if (btnFs) {
        btnFs.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleAppFullscreen();
        });
    }

    // Prayer widget → open settings on Widgets tab
    const prayerWidgetEl = document.getElementById('prayer-widget');
    if (prayerWidgetEl) {
        prayerWidgetEl.addEventListener('click', (e) => {
            e.stopPropagation();
            openSettingsModal();
            // Switch to widgets tab
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(c => c.classList.remove('active'));
            const widgetsTabBtn = document.querySelector('[data-tab="tab-widgets"]');
            const widgetsTabContent = document.getElementById('tab-widgets');
            if (widgetsTabBtn) widgetsTabBtn.classList.add('active');
            if (widgetsTabContent) widgetsTabContent.classList.add('active');
            // Focus the prayer location dropdown
            setTimeout(() => {
                const prayerCountryEl = document.getElementById('setting-prayer-country');
                if (prayerCountryEl) prayerCountryEl.focus();
            }, 150);
        });
    }

    // Language selector change
    const langSelect = document.getElementById('setting-lang');
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            appSettings.language = e.target.value;
            applyTranslations();
        });
    }

    // Whiteboard Toolbar Actions
    document.getElementById('btn-paint-back').addEventListener('click', () => {
        toggleWhiteboard(false);
    });

    document.getElementById('btn-paint-text').addEventListener('click', (e) => {
        isTextTool = !isTextTool;
        e.target.classList.toggle('active', isTextTool);
        if (isTextTool) {
            isEraser = false;
            document.getElementById('btn-paint-eraser').classList.remove('active');
        }
    });

    document.getElementById('btn-paint-eraser').addEventListener('click', (e) => {
        isEraser = !isEraser;
        e.target.classList.toggle('active', isEraser);
        if (isEraser) {
            isTextTool = false;
            document.getElementById('btn-paint-text').classList.remove('active');
            document.getElementById('canvas-text-input').classList.add('hidden');
        }
    });

    document.getElementById('btn-paint-undo').addEventListener('click', undoDrawing);

    document.getElementById('btn-paint-clear').addEventListener('click', () => {
        if (confirm("Çizimi temizlemek istediğinize emin misiniz?")) {
            ctx.fillStyle = "#111116";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawingHistory = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
            drawingRedoHistory = [];
        }
    });

    document.getElementById('btn-paint-save').addEventListener('click', () => {
        const base64 = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `niltab_cizim_${Date.now()}.png`;
        link.href = base64;
        link.click();
    });

    // Whiteboard Colors & Sizes
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            brushColor = e.target.getAttribute('data-color');
            isEraser = false;
            isTextTool = false;
            document.getElementById('btn-paint-eraser').classList.remove('active');
            document.getElementById('btn-paint-text').classList.remove('active');
            document.getElementById('canvas-text-input').classList.add('hidden');
        });
    });

    document.getElementById('paint-color-custom').addEventListener('change', (e) => {
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        brushColor = e.target.value;
        isEraser = false;
        isTextTool = false;
        document.getElementById('btn-paint-eraser').classList.remove('active');
        document.getElementById('btn-paint-text').classList.remove('active');
        document.getElementById('canvas-text-input').classList.add('hidden');
    });

    document.getElementById('paint-brush-size').addEventListener('input', (e) => {
        brushSize = e.target.value;
        document.getElementById('brush-size-val').textContent = `${brushSize}px`;
    });

    // Canvas text input event listeners
    const textInputEl = document.getElementById('canvas-text-input');
    textInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            commitCanvasText();
        } else if (e.key === 'Escape') {
            textInputEl.value = '';
            textInputEl.classList.add('hidden');
        }
    });
    textInputEl.addEventListener('blur', () => {
        commitCanvasText();
    });

    // Focus Mode double click exit
    document.getElementById('focus-overlay').addEventListener('dblclick', () => {
        toggleFocusMode(false);
    });

    // AI Voice assistant close
    document.getElementById('btn-voice-close').addEventListener('click', () => {
        if (recognition) recognition.stop();
        document.getElementById('voice-overlay').classList.add('hidden');
    });

    // Settings General Triggers & File Selector
    document.getElementById('setting-bg-blur').addEventListener('input', (e) => {
        document.getElementById('bg-blur-val').textContent = `${e.target.value}px`;
    });

    document.getElementById('setting-bg-brightness').addEventListener('input', (e) => {
        document.getElementById('bg-brightness-val').textContent = `${e.target.value}%`;
    });

    document.getElementById('btn-select-bg-file').addEventListener('click', () => {
        // Web mode: open file dialog and save to IndexedDB
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    await saveBackgroundBlob(file);
                    document.getElementById('setting-bg-path').value = 'stored_local_file';
                    appSettings.background_path = 'stored_local_file';
                    await saveSettingsQuietly();
                    applyBackground();
                } catch (err) {
                    console.error("Failed to save background file to IndexedDB:", err);
                    const t = i18n[appSettings.language] || i18n.tr;
                    alert(t.file_save_error);
                }
            }
        };
        input.click();
    });

    // Settings Modal Tab Navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

            e.target.classList.add('active');
            const tabId = e.target.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Weather City Geocoding API Search
    document.getElementById('btn-search-city').addEventListener('click', async () => {
        const cityInput = document.getElementById('setting-weather-city').value.trim();
        const feedback = document.getElementById('city-search-feedback');
        const t = i18n[appSettings.language] || i18n.tr;
        if (!cityInput) return;

        feedback.textContent = t.city_search_searching;
        feedback.className = 'help-text';

        try {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityInput)}&count=1&language=tr&format=json`);
            const data = await res.json();
            if (data.results && data.results.length > 0) {
                const cityData = data.results[0];
                appSettings.weather_city = cityData.name;
                appSettings.weather_lat = cityData.latitude;
                appSettings.weather_lon = cityData.longitude;

                feedback.textContent = `${t.gps_located}: ${cityData.name} (${cityData.country})`;
                feedback.className = 'help-text text-success';
                document.getElementById('setting-weather-city').value = cityData.name;
            } else {
                feedback.textContent = t.city_search_not_found;
                feedback.className = 'help-text text-alert';
            }
        } catch (e) {
            console.error("Geocoding fetch error:", e);
            feedback.textContent = t.weather_fetch_error;
            feedback.className = 'help-text text-alert';
        }
    });

    // Add Shortcut Button & Dialog
    document.getElementById('add-shortcut-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('diag-shortcut-name').value = '';
        document.getElementById('diag-shortcut-path').value = 'https://';
        document.getElementById('diag-shortcut-icon').value = '🌐';
        document.getElementById('shortcut-dialog').classList.remove('hidden');
    });

    document.getElementById('btn-dialog-shortcut-cancel').addEventListener('click', () => {
        document.getElementById('shortcut-dialog').classList.add('hidden');
    });

    document.getElementById('btn-dialog-shortcut-save').addEventListener('click', () => {
        const name = document.getElementById('diag-shortcut-name').value.trim();
        const url = document.getElementById('diag-shortcut-path').value.trim();
        const icon = document.getElementById('diag-shortcut-icon').value.trim() || '🌐';
        const t = i18n[appSettings.language] || i18n.tr;

        if (name && url) {
            if (!appSettings.shortcuts) appSettings.shortcuts = [];
            appSettings.shortcuts.push({ name, url, icon });
            initShortcuts();
            document.getElementById('shortcut-dialog').classList.add('hidden');
            // Clear fields
            document.getElementById('diag-shortcut-name').value = '';
            document.getElementById('diag-shortcut-path').value = 'https://';
            document.getElementById('diag-shortcut-icon').value = '🌐';
            saveSettingsQuietly();
        } else {
            alert(t.field_required);
        }
    });

    // Add Custom Calendar Event Button & Dialog
    document.getElementById('add-event-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('event-dialog').classList.remove('hidden');
    });

    document.getElementById('btn-dialog-event-cancel').addEventListener('click', () => {
        document.getElementById('event-dialog').classList.add('hidden');
    });

    document.getElementById('btn-dialog-event-save').addEventListener('click', () => {
        const summary = document.getElementById('diag-event-summary').value.trim();
        const start = document.getElementById('diag-event-start').value;
        const end = document.getElementById('diag-event-end').value;
        const t = i18n[appSettings.language] || i18n.tr;

        if (summary && start) {
            if (!appSettings.calendar_local_events) appSettings.calendar_local_events = [];
            appSettings.calendar_local_events.push({ summary, start, end, source: "Local" });
            initCalendar();
            document.getElementById('event-dialog').classList.add('hidden');
            document.getElementById('diag-event-summary').value = '';
            document.getElementById('diag-event-start').value = '';
            document.getElementById('diag-event-end').value = '';
            saveSettingsQuietly();
        } else {
            alert(t.cal_field_required);
        }
    });

    // Add Calendar ICS Source row in settings editor
    document.getElementById('btn-add-ics-source').addEventListener('click', () => {
        if (!appSettings.calendar_sync_ics) appSettings.calendar_sync_ics = [];
        appSettings.calendar_sync_ics.push('');
        renderSettingsIcsList();
    });

    document.getElementById('btn-upload-ics-web').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.ics';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target.result;
                    const webEvents = parseIcsContentJS(content, file.name);
                    const t = i18n[appSettings.language] || i18n.tr;
                    if (webEvents.length > 0) {
                        const storedWebEvents = localStorage.getItem('niltab_web_events') || localStorage.getItem('nilsaver_web_events');
                        let currentList = [];
                        if (storedWebEvents) {
                            try { currentList = JSON.parse(storedWebEvents); } catch (ex) { }
                        }
                        currentList.push(...webEvents);
                        localStorage.setItem('niltab_web_events', JSON.stringify(currentList));
                        alert(`${webEvents.length} ${t.ics_imported}`);
                        initCalendar(); // Refresh calendar view
                    } else {
                        alert(t.no_ics_events);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    });

    // Add Shortcut row in settings editor
    document.getElementById('btn-editor-add-shortcut').addEventListener('click', () => {
        if (!appSettings.shortcuts) appSettings.shortcuts = [];
        appSettings.shortcuts.push({ name: 'Yeni Kısayol', url: '', icon: '🌐' });
        renderSettingsShortcutsTable();
    });

    // Prayer Source switching listener
    const sourceSel = document.getElementById('setting-prayer-source');
    if (sourceSel) {
        sourceSel.addEventListener('change', (e) => {
            togglePrayerSourceUI(e.target.value);
        });
    }

    // Diyanet Settings Dropdowns cascading listeners
    const countrySel = document.getElementById('setting-prayer-country');
    if (countrySel) {
        countrySel.addEventListener('change', (e) => {
            loadStatesForCountry(parseInt(e.target.value));
        });
    }
    const stateSel = document.getElementById('setting-prayer-state');
    if (stateSel) {
        stateSel.addEventListener('change', (e) => {
            loadCitiesForState(parseInt(e.target.value));
        });
    }

    // Settings Modal Save & Cancel Actions
    document.getElementById('btn-settings-cancel').addEventListener('click', () => {
        document.getElementById('settings-overlay').classList.add('hidden');
        loadSettingsAndInit(); // Re-read original from backend to reset state
    });

    document.getElementById('settings-close-btn').addEventListener('click', () => {
        document.getElementById('settings-overlay').classList.add('hidden');
        loadSettingsAndInit();
    });

    document.getElementById('btn-settings-save').addEventListener('click', async () => {
        // Collect latest simple fields
        appSettings.language = document.getElementById('setting-lang').value;
        appSettings.mode = document.getElementById('setting-mode').value;
        appSettings.focus_clock_enabled = document.getElementById('setting-focus-clock').checked;
        appSettings.background_type = document.getElementById('setting-bg-type').value;
        appSettings.background_path = document.getElementById('setting-bg-path').value;
        appSettings.background_blur = parseInt(document.getElementById('setting-bg-blur').value) || 0;
        appSettings.background_brightness = parseInt(document.getElementById('setting-bg-brightness').value) || 70;

        appSettings.weather_enabled = document.getElementById('setting-weather-enabled').checked;
        appSettings.weather_city = document.getElementById('setting-weather-city').value.trim();
        appSettings.prayer_enabled = document.getElementById('setting-prayer-enabled').checked;
        appSettings.prayer_source = document.getElementById('setting-prayer-source').value;
        appSettings.prayer_method = parseInt(document.getElementById('setting-prayer-method').value) || 13;
        const countrySelect = document.getElementById('setting-prayer-country');
        const stateSelect = document.getElementById('setting-prayer-state');
        const citySelect = document.getElementById('setting-prayer-city');
        if (countrySelect && countrySelect.value) {
            appSettings.prayer_country_id = parseInt(countrySelect.value);
        }
        if (stateSelect && stateSelect.value) {
            appSettings.prayer_state_id = parseInt(stateSelect.value);
        }
        if (citySelect && citySelect.value) {
            appSettings.prayer_city_id = parseInt(citySelect.value);
            appSettings.prayer_city_name = citySelect.options[citySelect.selectedIndex].text;
            if (appSettings.prayer_source === 'diyanet') {
                localStorage.removeItem(`diyanet_prayer_times_${appSettings.prayer_city_id}`);
            }
        }

        appSettings.gemini_api_key = document.getElementById('setting-gemini-key').value.trim();

        // Mock/Web mode save
        localStorage.setItem('niltab_settings', JSON.stringify(appSettings));
        document.getElementById('settings-overlay').classList.add('hidden');
        initApp();
    });

    // Calendar month navigation buttons
    document.getElementById('btn-calendar-prev').addEventListener('click', (e) => {
        e.stopPropagation();
        displayedMonth--;
        if (displayedMonth < 0) {
            displayedMonth = 11;
            displayedYear--;
        }
        renderCalendarGrid();
    });

    document.getElementById('btn-calendar-next').addEventListener('click', (e) => {
        e.stopPropagation();
        displayedMonth++;
        if (displayedMonth > 11) {
            displayedMonth = 0;
            displayedYear++;
        }
        renderCalendarGrid();
    });

    // Weather Widget Click -> Open Forecast Modal
    document.getElementById('weather-widget').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('weather-modal').classList.remove('hidden');
        renderForecastModal(lastWeatherData);
    });

    document.getElementById('weather-close-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('weather-modal').classList.add('hidden');
    });

    document.getElementById('btn-forecast-search').addEventListener('click', async () => {
        const cityInput = document.getElementById('forecast-city-input').value.trim();
        const feedback = document.getElementById('forecast-location-feedback');
        const t = i18n[appSettings.language] || i18n.tr;

        if (!cityInput) return;
        feedback.style.color = '#ffffff';
        feedback.textContent = t.city_search_searching;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityInput)}&format=json&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                const item = data[0];
                appSettings.weather_city = cityInput;
                appSettings.weather_lat = parseFloat(item.lat);
                appSettings.weather_lon = parseFloat(item.lon);

                feedback.style.color = '#2ecc71';
                feedback.textContent = `${t.city_search_saved} (${cityInput})`;

                await saveSettingsQuietly();
                await initWeather();
                await initPrayerTimes();

                // Re-render forecast
                setTimeout(() => {
                    renderForecastModal(lastWeatherData);
                }, 1000);
            } else {
                feedback.style.color = '#e74c3c';
                feedback.textContent = t.city_search_not_found;
            }
        } catch (e) {
            console.error("Geocoding failed:", e);
            feedback.style.color = '#e74c3c';
            feedback.textContent = t.weather_fetch_error;
        }
    });

    document.getElementById('btn-forecast-gps').addEventListener('click', () => {
        requestGeolocationAndSave('forecast-location-feedback');
    });

    // Sayfa sekmesine geri dönüldüğünde veya internet bağlantısı sağlandığında 5 dakika geçmişse hava durumunu hemen güncelle
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && appSettings.weather_enabled) {
            if (Date.now() - lastWeatherFetchTime >= WEATHER_UPDATE_INTERVAL) {
                initWeather();
            }
        }
    });

    window.addEventListener('online', () => {
        if (appSettings.weather_enabled && (Date.now() - lastWeatherFetchTime >= WEATHER_UPDATE_INTERVAL)) {
            initWeather();
        }
    });
}

async function saveSettingsQuietly() {
    localStorage.setItem('niltab_settings', JSON.stringify(appSettings));
}

// Client-side ICS parsing for Web Mode
function parseIcsContentJS(content, sourceName) {
    const events = [];
    const rawEvents = content.split('BEGIN:VEVENT');
    for (let i = 1; i < rawEvents.length; i++) {
        const lines = rawEvents[i].split('\n');
        const eDict = { source: sourceName };
        for (let line of lines) {
            line = line.trim();
            if (line.includes(':')) {
                const idx = line.indexOf(':');
                const k = line.substring(0, idx).split(';')[0].toUpperCase();
                const v = line.substring(idx + 1);
                if (k === 'DTSTART') eDict.start = formatIcsDateJS(v);
                else if (k === 'DTEND') eDict.end = formatIcsDateJS(v);
                else if (k === 'SUMMARY') eDict.summary = v.replace(/\\,/g, ',').replace(/\\;/g, ';');
                else if (k === 'DESCRIPTION') eDict.description = v.replace(/\\n/g, '\n').replace(/\\,/g, ',');
            }
        }
        if (eDict.summary && eDict.start) {
            events.push(eDict);
        }
    }
    return events;
}

function formatIcsDateJS(rawVal) {
    rawVal = rawVal.trim();
    if (rawVal.length >= 8) {
        const year = rawVal.substring(0, 4);
        const month = rawVal.substring(4, 6);
        const day = rawVal.substring(6, 8);
        if (rawVal.includes('T') && rawVal.length >= 15) {
            const hour = rawVal.substring(9, 11);
            const minute = rawVal.substring(11, 13);
            const second = rawVal.substring(13, 15);
            return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
        }
        return `${year}-${month}-${day}T00:00:00`;
    }
    return rawVal;
}

// --- Search Bar Widget ---
function setupSearchBar() {
    const engineBtn = document.getElementById('engine-select-btn');
    const dropdown = document.getElementById('engine-dropdown-list');
    const inputField = document.getElementById('search-input-field');
    const searchBtn = document.getElementById('search-execute-btn');

    if (!engineBtn || !dropdown || !inputField || !searchBtn) return;

    // Load active engine
    const activeEngine = appSettings.search_engine || 'google';
    setSearchEngine(activeEngine);

    // Toggle dropdown
    engineBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
        engineBtn.classList.toggle('active');
    });

    // Close dropdown on click outside
    document.addEventListener('click', () => {
        dropdown.classList.remove('show');
        engineBtn.classList.remove('active');
    });

    // Select engine option
    dropdown.querySelectorAll('.engine-opt').forEach(opt => {
        opt.addEventListener('click', async (e) => {
            e.stopPropagation();
            const engine = opt.getAttribute('data-engine');
            setSearchEngine(engine);
            dropdown.classList.remove('show');
            engineBtn.classList.remove('active');

            // Save choice
            appSettings.search_engine = engine;
            await saveSettingsQuietly();
        });
    });

    // Execute search on enter
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = inputField.value.trim();
            if (query) {
                performSearch(query);
            }
        }
    });

    // Execute search on button click
    searchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const query = inputField.value.trim();
        if (query) {
            performSearch(query);
        }
    });
}

function setSearchEngine(engine) {
    const iconEl = document.getElementById('current-engine-icon');
    const nameEl = document.getElementById('current-engine-name');
    const inputField = document.getElementById('search-input-field');
    const dropdown = document.getElementById('engine-dropdown-list');

    if (!iconEl || !nameEl || !inputField || !dropdown) return;

    const t = i18n[appSettings.language] || i18n.tr;
    let icon = '🌐';
    let name = 'Google';
    let placeholder = t.search_google;

    if (engine === 'startpage') {
        icon = '🛡️';
        name = 'StartPage';
        placeholder = t.search_startpage;
    } else if (engine === 'duckduckgo') {
        icon = '🦆';
        name = 'DuckDuckGo';
        placeholder = t.search_duckduckgo;
    }

    iconEl.textContent = icon;
    nameEl.textContent = name;
    inputField.placeholder = placeholder;

    // Update selected class in dropdown
    dropdown.querySelectorAll('.engine-opt').forEach(opt => {
        if (opt.getAttribute('data-engine') === engine) {
            opt.classList.add('selected');
        } else {
            opt.classList.remove('selected');
        }
    });
}

function performSearch(query) {
    const engine = appSettings.search_engine || 'google';
    let url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

    if (engine === 'startpage') {
        url = `https://www.startpage.com/sp/search?query=${encodeURIComponent(query)}`;
    } else if (engine === 'duckduckgo') {
        url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    }

    window.open(url, '_blank');
}
