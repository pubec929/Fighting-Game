// All times and timers in this file

// Controls the time in the game
class getTime {
    constructor() {
        this.timeOffSett = 0;
    }

    get sinceStart() {
        // returns time since the game has started
        return Math.floor((this.sinceLoad - this.timeOffSett) / 1000);
    }

    get sinceLoad() {
        // returns time passed since page load
        return window.performance.now();
    }

    refresh() {
        // sets timeOffSett equal to time since page load
        this.timeOffSett = this.sinceLoad;
    }
}

class timer {
    constructor(periodOfTime, element) {
        this.periodOfTime = periodOfTime;
        this.element = element;
    }

    get timePassed() {
        return this.periodOfTime - time.sinceStart > 0 ? this.periodOfTime - time.sinceStart : 0;
    }

    formatTime(seconds) {
        if (!seconds) return "00:00";

        const formatNumbers = (number) => {
            if (number >= 10) return number.toString();
            return `0${number}`;
        }

        const timeMinutes = formatNumbers(Math.floor(seconds / 60));
        const timeSeconds = formatNumbers(seconds % 60);
        return `${timeMinutes}:${timeSeconds}`;

    }

    update() {
        let timeToDisplay = this.formatTime(this.periodOfTime);
        const totalTime = this.timePassed;
        if (totalTime >= 0) {
            timeToDisplay = this.formatTime(totalTime);
        }
        this.element.innerText = timeToDisplay;
    }
}


const time = new getTime(); 
