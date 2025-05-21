export default defineI18nConfig(() => ({
    legacy: false,
    availableLocales: ["en", "de"],
    locale: "de",
    messages: {
        en: {
            // Navigation menu translations
            navigation: {
                back: "Back",
                home: "Home",
                languages: "Languages",
            },

            // Reports table translations
            reportsTable: {
                title: "Reports",
                reportName: "Report Name",
                lastModified: "Last Modified",
                complaints: "Complaints",
                deleteSelected: "Delete Selected",
                reportsSelected: "{0} of {1} report(s) selected.",
                view: "View report",
                delete: "Delete report",
                noReports: "No reports found.",
            },

            report: {
                title: "Title",
                customer: "Customer",
                updateAt: "Updated at",
                createdAt: "Created at",
                notFound: "Report not found",
                noComplaints: "No complaints added yet",
                addComplaint: "Add complaint",
                loading: "Loading report...",
                saved: "Report saved",
                export: "Export Report",
                exported: "Report exported",
            },

            // Email export translations
            email: {
                enterEmail: "Enter email address",
                send: "Send Email",
                validEmail: "Please enter a valid email address",
                sent: "Email sent successfully",
            },

            // Camera component translations
            camera: {
                takePhoto: "Take Photo",
                switching: "Switching...",
                switchCamera: "Switch Camera ({0})",
                front: "Front",
                back: "Back",
                takeAPhoto: "Take a Photo",
                uploadAPhoto: "Upload a Photo",
                retake: "Retake",
                submit: "Submit",
                switchingCamera: "Switching camera...",
                capturedImageAlt: "Captured",
            },

            // Audio recorder component translations
            audio: {
                startRecording: "Start Recording",
                stopRecording: "Stop Recording",
                recordingInProgress: "Recording in progress...",
                errors: {
                    noMicrophoneDetected:
                        "No microphone detected on your device.",
                    noMicrophoneFound:
                        "No microphone found. Please connect a microphone and try again.",
                    accessDenied:
                        "Microphone access denied. Please allow microphone access in your browser settings.",
                    inUse: "Your microphone is in use by another application.",
                    constraints: "Microphone constraints cannot be satisfied.",
                    notCompatible:
                        "No microphone found or it's not compatible with your browser.",
                    troubleshooting: {
                        properlyConnected:
                            "Make sure your microphone is properly connected",
                        checkPermissions:
                            "Check browser permissions for microphone access",
                        differentBrowser: "Try using a different browser",
                        restart: "Restart your device if the issue persists",
                    },
                },
            },

            // Complaint view component translations
            complaint: {
                loading: "Loading ...",
                action: "Action",
                finding: "Finding",
                removeMemo: "Remove Memo",
                removeImage: "Remove Image",
                noImages: "No images captured yet.",
                capturedImages: "Captured Images:",
                notFound: "Complaint not found",
                addRecording: "Add Recording",
                addText: "Add Text",
                addImage: "Add Image",
                noItems: "No items use to plus button to add items",
            },

            // Speech to text component translations
            speechToText: {
                converting: "Converting speech to text...",
            },

            // Index page translations
            home: {
                createNewReport: "Create New report",
                creatingReport: "Creating your report...",
            },

            // Common buttons
            buttons: {
                add: "Add",
            },

            // Loading states
            loading: {
                loading: "Loading...",
            },

            // Confirm button component translations
            confirmButton: {
                confirmQuestion: "Are you sure?",
                cancel: "Cancel",
                confirm: "Confirm",
            },
        },

        de: {
            // Navigation menu translations
            navigation: {
                back: "Zurück",
                home: "Startseite",
                languages: "Sprachen",
            },

            // Reports table translations
            reportsTable: {
                title: "Berichte",
                reportName: "Berichtname",
                lastModified: "Zuletzt geändert",
                complaints: "Beschwerden",
                deleteSelected: "Ausgewählte löschen",
                reportsSelected: "{0} von {1} Bericht(en) ausgewählt.",
                view: "Bericht anzeigen",
                delete: "Bericht löschen",
                noReports: "Keine Berichte gefunden.",
            },

            report: {
                title: "Titel",
                customer: "Kunde",
                updateAt: "Aktualisiert am",
                createdAt: "Erstellt am",
                notFound: "Bericht nicht gefunden",
                noComplaints: "Noch keine Beschwerden hinzugefügt",
                addComplaint: "Beschwerde hinzufügen",
                loading: "Bericht wird geladen...",
                saved: "Bericht gespeichert",
                export: "Bericht exportieren",
                exported: "Bericht exportiert",
            },

            // Email export translations
            email: {
                enterEmail: "E-Mail-Adresse eingeben",
                send: "E-Mail senden",
                validEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
                sent: "E-Mail erfolgreich gesendet",
            },

            // Camera component translations
            camera: {
                takePhoto: "Foto aufnehmen",
                switching: "Wechsle...",
                switchCamera: "Kamera wechseln ({0})",
                front: "Vorne",
                back: "Hinten",
                takeAPhoto: "Foto aufnehmen",
                uploadAPhoto: "Foto hochladen",
                retake: "Neu aufnehmen",
                submit: "Bestätigen",
                switchingCamera: "Kamera wird gewechselt...",
                capturedImageAlt: "Aufgenommenes Bild",
            },

            // Audio recorder component translations
            audio: {
                startRecording: "Aufnahme starten",
                stopRecording: "Aufnahme beenden",
                recordingInProgress: "Aufnahme läuft...",
                errors: {
                    noMicrophoneDetected:
                        "Kein Mikrofon an Ihrem Gerät erkannt.",
                    noMicrophoneFound:
                        "Kein Mikrofon gefunden. Bitte schließen Sie ein Mikrofon an und versuchen Sie es erneut.",
                    accessDenied:
                        "Mikrofonzugriff verweigert. Bitte erlauben Sie den Mikrofonzugriff in Ihren Browsereinstellungen.",
                    inUse: "Ihr Mikrofon wird von einer anderen Anwendung verwendet.",
                    constraints:
                        "Mikrofoneinschränkungen können nicht erfüllt werden.",
                    notCompatible:
                        "Kein Mikrofon gefunden oder es ist nicht mit Ihrem Browser kompatibel.",
                    troubleshooting: {
                        properlyConnected:
                            "Stellen Sie sicher, dass Ihr Mikrofon richtig angeschlossen ist",
                        checkPermissions:
                            "Überprüfen Sie die Browserberechtigungen für den Mikrofonzugriff",
                        differentBrowser: "Versuchen Sie einen anderen Browser",
                        restart:
                            "Starten Sie Ihr Gerät neu, wenn das Problem weiterhin besteht",
                    },
                },
            },

            // Complaint view component translations
            complaint: {
                loading: "Lade ...",
                action: "Masnahme",
                finding: "Feststellung",
                removeMemo: "Notiz entfernen",
                removeImage: "Bild entfernen",
                noImages: "Noch keine Bilder aufgenommen.",
                capturedImages: "Aufgenommene Bilder:",
                notFound: "Beschwerde nicht gefunden",
                addRecording: "Aufnahme hinzufügen",
                addText: "Text hinzufügen",
                addImage: "Bild hinzufügen",
                noItems:
                    "Keine Elemente, verwenden Sie die Plus-Schaltfläche, um Elemente hinzuzufügen",
            },

            // Speech to text component translations
            speechToText: {
                converting: "Konvertiere Sprache zu Text...",
            },

            // Index page translations
            home: {
                createNewReport: "Neuen Bericht erstellen",
                creatingReport: "Bericht wird erstellt...",
            },

            // Common buttons
            buttons: {
                add: "Hinzufügen",
            },

            // Loading states
            loading: {
                loading: "Wird geladen...",
            },

            // Confirm button component translations
            confirmButton: {
                confirmQuestion: "Sind Sie sicher?",
                cancel: "Abbrechen",
                confirm: "Bestätigen",
            },
        },
    },
}));
