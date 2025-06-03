import type { Toast } from "@nuxt/ui/runtime/composables/useToast.js";

type AddToastFunc = (toast: Partial<Toast>) => Toast;

export class NotificationService {
    static $injectKey = "notificationService";
    static $inject = ["toast"];

    constructor(private readonly toast: AddToastFunc) {}

    notify(options: Partial<Toast>): Toast {
        return this.toast(options);
    }
}
