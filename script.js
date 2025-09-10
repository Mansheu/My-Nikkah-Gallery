document.addEventListener('DOMContentLoaded', () => {
  // Create the modal elements once and append them to the body
  const modal = document.createElement('div');
  modal.id = 'image-modal';
  modal.className = 'modal';

  const modalImage = document.createElement('img');
  modalImage.className = 'modal-content';

  // Prevent right-clicking on the modal image
  modalImage.addEventListener('contextmenu', (e) => e.preventDefault());

  const modalCaption = document.createElement('div');
  modalCaption.id = 'caption';

  const closeBtn = document.createElement('span');
  closeBtn.className = 'close-button';
  closeBtn.innerHTML = '&times;';

  modal.appendChild(closeBtn);
  modal.appendChild(modalImage);
  modal.appendChild(modalCaption);

  const thumbnailContainer = document.createElement('div');
  thumbnailContainer.className = 'thumbnail-container';
  modal.appendChild(thumbnailContainer);
  document.body.appendChild(modal);

  // Create navigation arrows
  const prevBtn = document.createElement('a');
  prevBtn.className = 'prev';
  prevBtn.innerHTML = '&#10094;';
  modal.appendChild(prevBtn);

  const nextBtn = document.createElement('a');
  nextBtn.className = 'next';
  nextBtn.innerHTML = '&#10095;';
  modal.appendChild(nextBtn);

  // Get all gallery items
  let galleryItems = []; // This will be populated when an album is opened
  let currentIndex = 0;
  let thumbnails = [];
  
  const showImage = (index) => {
    if (index >= galleryItems.length) {
      index = 0;
    } else if (index < 0) {
      index = galleryItems.length - 1;
    }
    currentIndex = index;
    const item = galleryItems[currentIndex];
    modalImage.src = item.querySelector('img').src;
    // For the main modal image, we ensure it's the high-resolution one from data-src
    modalImage.src = item.querySelector('img').dataset.src;
    modalCaption.textContent = item.dataset.caption;

    // Update active thumbnail
    thumbnails.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === currentIndex);
      // Scroll active thumbnail into view if needed
      if (i === currentIndex) thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  };

  // Function to close the modal
  const closeModal = () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
  };

  // Close the modal when the close button is clicked
  closeBtn.addEventListener('click', closeModal);

  // Close the modal when clicking outside the image
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Arrow navigation
  prevBtn.addEventListener('click', () => showImage(currentIndex - 1));
  nextBtn.addEventListener('click', () => showImage(currentIndex + 1));

  // --- New Album Logic ---
  const albumSelectionView = document.getElementById('album-selection');
  const albumView = document.getElementById('album-view');
  const albumPhotosContainer = document.getElementById('album-photos');
  const backButton = document.getElementById('back-to-albums');
  const allPhotosSource = document.querySelectorAll('.photo-source .gallery-item');
  
  // Group all photos by their `data-album` attribute automatically.
  const albumContents = {};
  allPhotosSource.forEach(photoNode => {
    const albumName = photoNode.dataset.album;
    if (!albumName) return; // Skip if no album is assigned
    if (!albumContents[albumName]) {
      albumContents[albumName] = [];
    }
    albumContents[albumName].push(photoNode);
  });

  // --- Lazy Loading Logic with Intersection Observer ---
  let observer;

  const lazyLoad = (target) => {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;

          img.setAttribute('src', src);
          img.classList.remove('lazy'); // Optional: remove class after loading

          // Stop observing the image once it has been loaded
          observer.unobserve(img);
        }
      });
    });

    io.observe(target);
  };


  const openAlbum = (albumName) => {
    // Clear previous album photos and thumbnails
    albumPhotosContainer.innerHTML = '';
    thumbnailContainer.innerHTML = '';
    thumbnails = [];
    galleryItems = [];

    const photos = albumContents[albumName];
    photos.forEach((photoNode, index) => {
      // Clone the node to avoid issues with re-appending
      const photo = photoNode.cloneNode(true);
      albumPhotosContainer.appendChild(photo);

      // Set up lazy loading for the thumbnail in the grid
      const lazyImage = photo.querySelector('img.lazy');
      if (lazyImage) lazyLoad(lazyImage);

      galleryItems.push(photo);

      // Add click listener for the lightbox
      photo.addEventListener('click', (event) => {
        event.preventDefault();
        photo.addEventListener('contextmenu', (e) => e.preventDefault());
        showImage(index);
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });

      // Create thumbnails for the lightbox
      const thumb = document.createElement('img');
      // Use the high-res source for thumbnails too, they are small anyway
      thumb.src = photo.querySelector('img').dataset.src;
      thumb.className = 'thumbnail-img';
      thumb.addEventListener('click', () => showImage(index));
      thumbnailContainer.appendChild(thumb);
      thumbnails.push(thumb);
    });

    // Switch views
    albumSelectionView.classList.add('hidden');
    albumView.classList.remove('hidden');
  };

  document.querySelectorAll('.album-card').forEach(card => {
    card.addEventListener('click', () => openAlbum(card.dataset.album));
  });

  backButton.addEventListener('click', () => {
    albumView.classList.add('hidden');
    albumSelectionView.classList.remove('hidden');
  });

  // --- Scroll to Top Button Logic ---
  const scrollToTopBtn = document.getElementById('scroll-to-top-btn');

  // Show or hide the button based on scroll position
  window.onscroll = () => {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
      scrollToTopBtn.style.display = 'block';
      // Use a timeout to allow the display property to apply before changing opacity
      setTimeout(() => {
        scrollToTopBtn.style.opacity = '1';
        scrollToTopBtn.style.visibility = 'visible';
      }, 10);
    } else {
      scrollToTopBtn.style.opacity = '0';
      scrollToTopBtn.style.visibility = 'hidden';
    }
  };

  // When the user clicks on the button, scroll to the top of the document
  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});