  // JavaScript code to display the current date
  const currentDateElement = document.getElementById('current-date');
  const currentDate = new Date();
  currentDateElement.textContent = currentDate.toDateString();


//   $(document).ready(function() {
//     $('#shakeForm').on('submit', function(e) {
//       e.preventDefault(); // Prevent the form from submitting
  
//       $('#shakeBtn').addClass('shake');
  
//       // Remove the shake class after a duration
//       setTimeout(function() {
//         $('#shakeBtn').removeClass('shake');
//         $('#shakeForm').submit(); // Submit the form after the animation ends
//       }, 500);
//     });
//   });