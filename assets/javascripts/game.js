jQuery(function($) {

  if($('#page404').length == 1) {

    var ratio_speed = 1.25;
    var size_sprite_window = Math.ceil($(window).width() / 100) * 100;
    var link_size = 119;
    var max = 1071;
    var current_position = 0;
    var fence_just_spawned = 0;
    var speed = ratio_speed * size_sprite_window;
    var is_jumping = false;
    var game_started = false;
    var intervalGame, intervalFences;
    var margin_error = 10;
    var score = 0;
    var fences_generated = 0;
    var current_fence_passed = 0;

    // Animation du sprite du personnage
    setInterval(function() {
      if(current_position < max) {
        current_position += link_size;
      }
      else {
        current_position = 0;
      }
      $('.link-anim').css('background-position', '-'+current_position+'px');
    }, 60);

    // On fait défiler le sol
    backgroundScroll($('.ground'), size_sprite_window, speed);

    // Fonction qui va démarrer le jeu
    function launchGame() {
      score = 0;
      fences_generated = 0;
      game_started = true;
      current_fence_passed = 0;
      $('.game-info').removeClass('bounceIn');
      if(!$('.game-info').hasClass('bounceOut')) {
        $('.game-info').addClass('bounceOut');
      }
      intervalFences = setInterval(function() {
        if(Math.floor((Math.random() * 10) + 1) == 1 && fence_just_spawned == 0) {
          fences_generated++;
          var $fence = $("<div>", {"class": "fence", "data-id": fences_generated});
          $('.fences').append($fence);
          size_sprite_window = Math.ceil($(window).width() / 100) * 100;
          speed = ratio_speed * size_sprite_window;
          moveFence($fence, size_sprite_window, speed + 140);
          fence_just_spawned = 100;
        }
        if(fence_just_spawned > 0) {
          fence_just_spawned += 100;
        }
        if(fence_just_spawned >= 1000) {
          fence_just_spawned = 0;
        }
      }, 100);
      intervalGame = setInterval(function() {
        $('.score span').html(score);
        $('.fence').each(function() {
          // Quand l'obstacle se trouve au même endroit que le personnage avec marge d'erreur
          if($(this).offset().left + margin_error <= $('.link-anim').offset().left + $('.link-anim').width() && $(this).offset().left + $(this).width() - (4 * margin_error) >= $('.link-anim').offset().left) {
            // On vérifie s'il est en l'air ou pas
            if($('.link-anim').offset().top + $('.link-anim').height() > $(this).offset().top) {
              console.log("Score : " + score);
              stopGame();
            }
          }
          // Quand l'obstacle est passé, on augmente le compteur
          if($(this).offset().left + $(this).width() < $('.link-anim').offset().left) {
            if(current_fence_passed < $(this).attr('data-id')) {
              score++;
              current_fence_passed = $(this).attr('data-id');
            }
          }
        });
      }, 20);
    }

    // Fonction qui va arrêter le jeu
    function stopGame() {
      $('.fence').remove();
      clearInterval(intervalGame);
      clearInterval(intervalFences);
      $('.game-info').removeClass('bounceOut');
      if(!$('.game-info').hasClass('bounceIn')) {
        $('.game-info').addClass('bounceIn');
      }
      game_started = false;
    }

    // Fonction qui va gérer le défilement du sol
    function backgroundScroll(el, width, speed) {        
      el.animate({'background-position' : '-'+width+'px'}, speed, 'linear', function() {
        el.css('background-position','0');
        backgroundScroll(el, width, speed);
      });
    }

    // Fonction qui va lancer l'animation de l'obstacle
    function moveFence(el, width, speed) {     
      el.animate({'right' : width+'px'}, speed, 'linear', function() {
        el.remove();
      });
    }

    // Fonction qui va s'occuper de faire sauter Link
    function jumpLink() {
      is_jumping = true;
      $('.link-anim').animate({ bottom: '250px' }, 250, "easeOutExpo", function() {
        $('.link-anim').animate({ bottom: '100px' }, 150, "easeOutExpo", function() {
          is_jumping = false;
        });
      });
    }

    // Si la fenêtre est retaillée, on stoppe le jeu en dessous de 768px, sinon on met à jour la vitesse du sol (distance changée donc vitesse changée)
    $(window).resize(function() {
      size_sprite_window = Math.ceil($(window).width() / 100) * 100;
      speed = ratio_speed * size_sprite_window;
      backgroundScroll($('.ground'), size_sprite_window, speed);
      if($(window).width() < 768 && game_started) {
        stopGame();
      }
    });

    // Détection des actions faites par les touches
    window.onkeydown = function(e) {
      // On stoppe le jeu :
      //    - si on appuie sur echap
      //    - si le jeu est démarré
      //    - si la fenêtre fait bien au minimum 768px
      if(e.keyCode == 27 && e.target == document.body && game_started && $(window).width() > 767) {
        e.preventDefault();
        stopGame();
      }
      // On démarre le jeu :
      //    - si on appuie sur entrée
      //    - si le jeu n'est pas encore démarré
      //    - si la fenêtre fait bien au minimum 768px
      if(e.keyCode == 13 && e.target == document.body && !game_started && $(window).width() > 767) {
        e.preventDefault();
        launchGame();
      }
      // Link saute :
      //    - si on appuie sur la barre espace
      //    - si la fenêtre fait au moins 768px
      //    - si Link n'est pas en train de sauter déjà
      //    - même si le jeu n'est pas démarré
      else if(e.keyCode == 32 && e.target == document.body) {
        e.preventDefault();
        if($(window).width() > 767 && !is_jumping) {
          jumpLink();
        }
        return false;
      }
    };

  }

});