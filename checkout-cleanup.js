function removeBirthdayCheckoutField() {
  document.querySelectorAll('#bookingForm input[name="birthday"]').forEach(input => {
    const field = input.closest("label");
    if (field) field.remove();
    else input.remove();
  });
}

removeBirthdayCheckoutField();

const checkoutCleanupObserver = new MutationObserver(removeBirthdayCheckoutField);
checkoutCleanupObserver.observe(document.getElementById("app"), {
  childList: true,
  subtree: true
});
