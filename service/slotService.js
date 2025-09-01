import { logger } from "../utils/winstonLogger.js";
import { formatUser } from "./userService.js";


export const formatSlots = (slots, professor) =>{
    let finalSlots = {
        professor : formatUser(professor),
        slots: []
    }

    slots.forEach(slot => {
        finalSlots.slots.push({id: slot.id, slot : slot.slot});
    });

    return finalSlots;
}