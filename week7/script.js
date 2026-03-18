function validateForm() {
  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const output = document.getElementById("output");

  try {
    // EMPTY CHECK
    if (name === "" || age === "") {
      throw "All fields are required!";
    }

    // NAME should not contain numbers
    if (!isNaN(name)) {
      throw "Name should not be a number!";
    }

    // AGE should be a number
    if (isNaN(age)) {
      throw "Age should be a number!";
    }

    // AGE LIMIT
    if (age < 18) {
      throw "Age must be 18+!";
    }

    output.innerText = "✅ User added successfully!";

  } catch (error) {
    output.innerText = "❌ Error: " + error;
  }
}