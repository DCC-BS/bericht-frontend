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
                selectAll: "Select All",
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
                delete: "Delete report?",
                transcribing_recordings: "Transcribing audio recordings...",
                generating_titles: "Generating complaint titles...",
            },

            // Email export translations
            email: {
                enterEmail: "Enter email address",
                send: "Send Email",
                validEmail: "Please enter a valid email address",
                sent: "Email sent successfully",
                error: "An error occurred while sending the email",
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
                delete: "delete {type}?",
                textPlaceholder: "Enter your text here...",
            },

            // Complaint item component translations
            complaintItem: {
                addText: "Add Text",
            },

            // Speech to text component translations
            speechToText: {
                converting: "Converting speech to text...",
                error: "Error during speech-to-text conversion",
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

            // Delete modal component translations
            deleteModal: {
                delete: "Delete",
                cancel: "Cancel",
            },

            // Audio element translations
            audioElement: {
                browserNotSupported:
                    "Your browser does not support the audio element.",
            },

            // Drawing canvas translations
            drawing: {
                clearConfirm: "Clear all drawings?",
            },

            // Document generation translations
            document: {
                createdAt: "Created at:",
            },

            // Image drawing translations
            imageDrawing: {
                discardChanges: "Discard your changes?",
            },

            // Report creation translations
            reportCreation: {
                defaultName: "New Report",
            },

            // Map view translations
            map: {
                getGpsPosition: "Get GPS Position",
                done: "Done",
                locatingGpsPosition: "Locating GPS Position",
                allowLocationAccess:
                    "Please allow location access to get your current position",
                geolocationNotSupported:
                    "Geolocation is not supported or coordinates are not available.",
                address: "Address",
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
                selectAll: "Alle auswählen",
                reportName: "Berichtname",
                lastModified: "Zuletzt geändert",
                complaints: "Einträge",
                deleteSelected: "Ausgewählte löschen",
                reportsSelected: "{0} von {1} Bericht(en) ausgewählt.",
                view: "Bericht anzeigen",
                delete: "Bericht löschen",
                noReports: "Keine Berichte gefunden.",
            },

            report: {
                title: "Titel",
                location: "Standort",
                customer: "Kunde",
                updateAt: "Aktualisiert am",
                createdAt: "Erstellt am",
                notFound: "Bericht nicht gefunden",
                noComplaints: "Noch keine Eintrag hinzugefügt",
                addComplaint: "Eintrag hinzufügen",
                loading: "Bericht wird geladen...",
                saved: "Bericht gespeichert",
                export: "Bericht exportieren",
                exported: "Bericht exportiert",
                delete: "Bericht löschen?",
                transcribing_recordings: "Transkribiere Audioaufnahmen...",
                generating_titles: "Generiere Titel...",
            },

            // Email export translations
            email: {
                enterEmail: "E-Mail-Adresse eingeben",
                send: "E-Mail senden",
                validEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
                sent: "E-Mail erfolgreich gesendet",
                error: "Beim Senden der E-Mail ist ein Fehler aufgetreten",
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
                notFound: "Eintrag nicht gefunden",
                addRecording: "Aufnahme hinzufügen",
                addText: "Text hinzufügen",
                addImage: "Bild hinzufügen",
                delete: "{type} löschen?",
                noItems:
                    "Keine Elemente, verwenden Sie die Plus-Schaltfläche, um Elemente hinzuzufügen",
                textPlaceholder: "Geben Sie hier Ihren Text ein...",
            },

            // Complaint item component translations
            complaintItem: {
                addText: "Text hinzufügen",
            },

            // Speech to text component translations
            speechToText: {
                converting: "Konvertiere Sprache zu Text...",
                error: "Fehler bei der Sprache-zu-Text-Konvertierung",
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

            // Delete modal component translations
            deleteModal: {
                delete: "Löschen",
                cancel: "Abbrechen",
            },

            // Audio element translations
            audioElement: {
                browserNotSupported:
                    "Ihr Browser unterstützt das Audio-Element nicht.",
            },

            // Drawing canvas translations
            drawing: {
                clearConfirm: "Alle Zeichnungen löschen?",
            },

            // Document generation translations
            document: {
                createdAt: "Erstellt am:",
            },

            // Image drawing translations
            imageDrawing: {
                discardChanges: "Änderungen verwerfen?",
            },

            // Report creation translations
            reportCreation: {
                defaultName: "Neuer Bericht",
            },

            // Map view translations
            map: {
                getGpsPosition: "GPS-Position abrufen",
                done: "Fertig",
                locatingGpsPosition: "GPS-Position wird ermittelt",
                allowLocationAccess:
                    "Bitte erlauben Sie den Standortzugriff, um Ihre aktuelle Position zu erhalten",
                geolocationNotSupported:
                    "Geolokalisierung wird nicht unterstützt oder Koordinaten sind nicht verfügbar.",
                address: "Adresse",
            },
        },
    },
}));
