// --- Only allow dates from tomorrow onward ---
const dateSelect = document.getElementById("dateSelect");
const today = new Date();
today.setDate(today.getDate() + 1);

for (let i = 0; i < 15; i++) {
    let future = new Date();
    future.setDate(today.getDate() + i);
    let d = future.toISOString().split("T")[0];
    let opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    dateSelect.appendChild(opt);
}

// --- SEND TO WHATSAPP ---
document.getElementById("submitBtn").addEventListener("click", function () {

    let name = document.getElementById("fullname").value;
    let email = document.getElementById("email").value;
    let phone = document.getElementById("phone").value;
    let company = document.getElementById("company").value;
    let training = document.getElementById("training").value;
    let date = document.getElementById("dateSelect").value;
    let time = document.getElementById("timeSelect").value;
    let message = document.getElementById("message").value;

    if (!name || !email || !phone || !training || !date || !time) {
        alert("Please fill all required fields.");
        return;
    }

    let whatsapp = "919876543210"; // <<< Your number without "+"

    let msg =
`New Discovery Call Booking:
-----------------------------
Name: ${name}
Email: ${email}
Phone: ${phone}
Company: ${company}
Training Type: ${training}
Date: ${date}
Time: ${time}

Additional Message:
${message}
-----------------------------
`;

    let url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
});
