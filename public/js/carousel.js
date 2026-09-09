// Configurações Globais dos Carrosséis Swiper

document.addEventListener('DOMContentLoaded', () => {
    // 1. Carrossel Automático de Destaques (Banner do Topo)
    window.bannerSwiper = new Swiper('.banner-swiper', {
        loop: true,
        autoplay: {
            delay: 3500,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        observer: true,
        observeParents: true,
    });

    // Função auxiliar para inicializar os carrosséis de produtos em grade
    function initProductCarousel(selector, nextBtn, prevBtn) {
        return new Swiper(selector, {
            slidesPerView: 1,
            spaceBetween: 20,
            navigation: {
                nextEl: nextBtn,
                prevEl: prevBtn,
            },
            breakpoints: {
                640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
                768: {
                    slidesPerView: 3,
                    spaceBetween: 25,
                },
                1024: {
                    slidesPerView: 4,
                    spaceBetween: 30,
                },
            },
            observer: true,
            observeParents: true,
        });
    }

    // 2. Carrossel de Canecas
    window.canecasSwiper = initProductCarousel('.canecas-swiper', '.canecas-next', '.canecas-prev');

    // 3. Carrossel de Camisas
    window.camisasSwiper = initProductCarousel('.camisas-swiper', '.camisas-next', '.camisas-prev');

    // 4. Carrossel de Itens Personalizados (NOVO)
    window.itensSwiper = initProductCarousel('.itens-swiper', '.itens-next', '.itens-prev');
});