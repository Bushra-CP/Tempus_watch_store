function editProfile() {
    document.getElementById('editProfileModal').classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function saveProfile() {
    alert('Profile updated successfully!');
    closeModal('editProfileModal');
}

function uploadPhoto() {
    alert('Photo upload feature would open here.');
}

function openSection(section) {
    const messages = {
        'profile': 'Profile settings would open with detailed personal information management',
        'orders': 'Order history with tracking, returns, and reorder options would be displayed',
        'wallet': 'Wallet management with payment methods, transaction history, and balance details',
        'addresses': 'Address book management for shipping and billing addresses',
    };
    alert(messages[section] || 'Section details would be displayed here');
}

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
});
