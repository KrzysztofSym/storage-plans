"use strict";
addEventListener("DOMContentLoaded", () => {
    let usage = {
        music: 1.4,
        images: 0.487,
        videos: 1.1,
        others: 0.623,
    };
    let plans = [
        {
            id: 1,
            storage: 30,
            perMonth: 0,
            perYear: 0,
        },
        {
            id: 2,
            storage: 100,
            perMonth: 17,
            perYear: 170,
        },
        {
            id: 3,
            storage: 1000,
            perMonth: 89,
            perYear: 899,
        },
    ];
    function updateChart(procent) {
        document.querySelector(".slice").setAttribute("stroke-dasharray", `${(procent * 31.4) / 100} 31.4`);
    }
    function convertGb(value) {
        if (value < 1) return `${value * 1000} MB`;
        if (value >= 1000) return `${value / 1000} TB`;
        return `${value} GB`;
    }
    function generatePlanHtml(plan, active = false) {
        let html = `<li><button data-id="${plan.id}" aria-pressed="`;
        if (active) html += `true`;
        else html += `false`;
        html += `"><h3>${convertGb(plan.storage)}</h3><div>`;
        if (plan.perMonth > 0) html += `<span class="per-month">NOK ${plan.perMonth.toFixed(2)}/month</span>`;
        if (plan.perYear > 0) html += `<span class="per-year">Or prepay anually NOK ${plan.perYear.toFixed(2)}/year</span>`;
        html += `</div></button></li>`;
        return html;
    }
    function generatePlansHtml(plans, whichActive = 0) {
        let html = ``;
        plans.forEach((plan, index) => {
            let active = false;
            if (whichActive === index) active = true;
            html += generatePlanHtml(plan, active);
        });
        return html;
    }
    function changePlan(plan) {
        let totalUsage = 0;
        let html = ``;
        for (const [key, value] of Object.entries(usage)) {
            totalUsage += value;
            html += `<dt>${key}</dt><dd>${convertGb(value)}</dd>`;
        }
        let procent = (totalUsage / plan.storage) * 100;
        document.querySelector(".total-dd").innerHTML = convertGb(plan.storage);
        document.querySelector(".used-dt span").innerHTML = procent.toPrecision(2) + "%";
        document.querySelector(".used-dd").innerHTML = convertGb(totalUsage.toPrecision(2));
        document.querySelector("#usage details dl").innerHTML = html;
        updateChart(procent);
    }
    changePlan(plans[0]);
    document.querySelector("#plans ul").innerHTML = generatePlansHtml(plans);
    let plansButtonsDom = document.querySelectorAll("#plans button");
    plansButtonsDom.forEach((button) => {
        button.addEventListener("click", (event) => {
            const currentButton = event.target.closest("button");
            plansButtonsDom.forEach((button) => {
                if (button === currentButton) button.ariaPressed = "true";
                else button.ariaPressed = "false";
            });
            changePlan(plans.filter((plan) => plan.id === parseInt(currentButton.getAttribute("data-id")))[0]);
        });
    });

    //// thumbnail hack
    if (navigator.userAgent.includes("Headless")) {
        document.documentElement.style.setProperty("--transition-speed-fast", "0s");
        document.documentElement.style.setProperty("--transition-speed-medium", "0s");
        document.documentElement.style.setProperty("--transition-speed-slow", "0s");
        //const workInProgress = `<span style="position: absolute; inset-inline: 0; inset-block-end: 152px; inline-size: 100%; color: #fff; background-color: #2c2446; font-size: 3rem; font-weight: bold; text-align: center; padding: 0.5rem;">Work in progress…<span>`;
        //document.body.insertAdjacentHTML("beforeend", workInProgress);
        document.body.style.setProperty("padding-block-end", "0");
        document.body.style.setProperty("margin-block-start", "152px");
        document.body.style.setProperty("min-block-size", "0");
        document.body.style.setProperty("block-size", "calc(100vh - 304px)");
        document.body.style.setProperty("position", "relative");
    }

    //// modals
    document.querySelectorAll("dialog").forEach((dialog) => {
        // close .hiding dialog after animation ends
        dialog.addEventListener("animationend", (event) => {
            if (event.target.classList.contains("hiding")) {
                event.target.close();
                event.target.classList.remove("hiding");
            }
        });
        // add .hiding class when clicked on modal backdrop
        dialog.addEventListener("click", (event) => {
            const dialog = event.target.closest("dialog");
            const rect = dialog.getBoundingClientRect();
            const isInDialog = rect.top <= event.clientY && event.clientY <= rect.top + rect.height && rect.left <= event.clientX && event.clientX <= rect.left + rect.width;
            if (!isInDialog && event.target.tagName === "DIALOG") {
                dialog.classList.add("hiding");
            }
        });
    });
    /// modals close buttons
    const modalCloseButtons = document.querySelectorAll("dialog .close-button");
    modalCloseButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.target.closest("button").blur();
            event.target.closest("dialog").classList.add("hiding");
        });
    });

    //// settings
    const settingsModal = document.querySelector("#settings-modal");

    /// open settings modal
    const settingsOpenButtonHtml = `
	  <button class="settings-open-button">
			<svg class="icon" width="24" height="24" stroke-width="1" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
				<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
				<path d="M4 10a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
				<path d="M6 4v4"></path>
				<path d="M6 12v8"></path>
				<path d="M10 16a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
				<path d="M12 4v10"></path>
				<path d="M12 18v2"></path>
				<path d="M16 7a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
				<path d="M18 4v1"></path>
				<path d="M18 9v11"></path>
			</svg>
			<span>settings</span>
		</button>`;
    document.body.insertAdjacentHTML("beforeend", settingsOpenButtonHtml);
    const settingsOpenButtons = document.querySelectorAll(".settings-open-button");
    settingsOpenButtons.forEach((button) => {
        button.addEventListener("click", () => {
            settingsModal.showModal();
        });
    });

    /// dark mode
    const settingsDarkmode = document.querySelector("#settings-darkmode");
    if (document.documentElement.getAttribute("data-theme") === "dark") settingsDarkmode.checked = true;
    else settingsDarkmode.checked = false;
    settingsDarkmode.addEventListener("change", () => {
        if (settingsDarkmode.checked) {
            document.documentElement.setAttribute("data-theme", "dark");
        } else {
            document.documentElement.setAttribute("data-theme", "light");
        }
    });

    /// accent color
    const settingsHue = document.querySelector("#settings-hue");
    settingsHue.value = getComputedStyle(document.documentElement).getPropertyValue("--color-accent-1-h");
    settingsHue.addEventListener("input", () => {
        document.documentElement.style.setProperty("--color-accent-1-h", settingsHue.value);
    });
});
