<?php
 /**
  *------
  * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
  * AfterUs implementation : © <Your name here> <Your email address here>
  * 
  * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
  * See http://en.boardgamearena.com/#!doc/Studio for more information.
  * -----
  * 
  * afterus.game.php
  *
  * This is the main file for your game logic.
  *
  * In this PHP file, you are going to defines the rules of the game.
  *
  */


require_once(APP_GAMEMODULE_PATH.'module/table/table.game.php');

require_once('modules/php/objects/card.php');
require_once('modules/php/objects/player.php');
require_once('modules/php/objects/undo.php');
require_once('modules/php/constants.inc.php');
require_once('modules/php/utils.php');
require_once('modules/php/actions.php');
require_once('modules/php/states.php');
require_once('modules/php/args.php');
require_once('modules/php/debug-util.php');

class AfterUs extends Table {
    use UtilTrait;
    use ActionTrait;
    use StateTrait;
    use ArgsTrait;
    use DebugUtilTrait;

	function __construct() {
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();
        
        self::initGameStateLabels([
            LAST_TURN => LAST_TURN,

            OBJECTS_OPTION => OBJECTS_OPTION,
        ]);   
		
        $this->cards = $this->getNew("module.common.deck");
        $this->cards->init("card");
        $this->cards->autoreshuffle = false;     
	}
	
    protected function getGameName() {
		// Used for translations and stuff. Please do not modify.
        return "afterus";
    }	

    /*
        setupNewGame:
        
        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame( $players, $options = []) {    
        // Set the colors of the players with HTML color code
        // The default below is red/green/blue/orange/brown
        // The number of colors defined here must correspond to the maximum number of players allowed for the gams
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];
 
        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar, player_auto_gain) VALUES ";
        $values = [];
        foreach( $players as $player_id => $player ) {
            $color = array_shift( $default_colors );

            $autoGain = 0;
            if (array_key_exists($player_id, $this->player_preferences) && array_key_exists(201, $this->player_preferences[$player_id])) {
                $autoGain = intval($this->player_preferences[$player_id][201]);
            }
            $values[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."', $autoGain)";
        }
        $sql .= implode(',', $values);
        self::DbQuery( $sql );
        self::reattributeColorsBasedOnPreferences( $players, $gameinfos['player_colors'] );
        self::reloadPlayersBasicInfos();
        
        /************ Start the game initialization *****/

        // Init global values with their initial values
        $this->setGameStateInitialValue(LAST_TURN, 0);
        
        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)

        $this->initStat('table', 'roundNumber', 0);
        // Statistics existing for each player
        foreach([
            // 30+ : effects
            "activatedEffects", "activatedEffectsFree", "activatedEffectsCost", "activatedEffectsToken", "skippedEffects",
            // 40+ : resources
            "resourcesGained", "resourcesGained".FLOWER, "resourcesGained".FRUIT, "resourcesGained".GRAIN, "resourcesGained".ENERGY, "resourcesGained".POINT, "resourcesGained".RAGE,
            "resourcesSpent", "resourcesSpent".FLOWER, "resourcesSpent".FRUIT, "resourcesSpent".GRAIN, "resourcesSpent".ENERGY,    
            // 60+ : tokens
            "activatedTokens", "activatedTokens".MANDRILLS, "activatedTokens".ORANGUTANS, "activatedTokens".GORILLAS, "activatedTokens".CHIMPANZEES,
            // 70+ : cards
            "cardsBought1", "cardsBought2",
            "addedCards", "finalCardCount",
            // 80+ : rage
            "removedCards", "removedCards0", "removedCards1", "removedCards2",
            "rageGain", "rageGain".FLOWER, "rageGain".FRUIT, "rageGain".GRAIN, "rageGain".ENERGY, "rageGain".POINT,
            // 100+ : objects
            "usedObjects"
        ] as $name) {
            $this->initStat('player', $name, 0);
        }

        // setup the initial game situation here
        $this->setupCards(array_keys($players));
        $this->setupObjects(intval($this->getGameStateValue(OBJECTS_OPTION)) == 1);

        // Activate first player (which is in general a good idea :) )
        $this->activeNextPlayer();

        // TODO TEMP
        $this->debugSetup();

        /************ End of the game initialization *****/
    }

    /*
        getAllDatas: 
        
        Gather all informations about current game situation (visible by the current player).
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas() {
        $result = [];
    
        $currentPlayerId = intval(self::getCurrentPlayerId());    // !! We must only return informations visible by this player !!
    
        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
        $sql = "SELECT player_id id, player_score score, player_score_aux scoreAux, player_no playerNo, `player_flower` flowers, `player_fruit` fruits, `player_grain` grains, `player_energy` energy, `player_rage` rage, `chosen_token` chosenToken FROM player ";
        $result['players'] = self::getCollectionFromDb( $sql );
  
        // Gather all information about current game situation (visible by player $current_player_id).

        $isEndScore = intval($this->gamestate->state_id()) >= ST_END_SCORE;
        
        foreach($result['players'] as $playerId => &$player) {
            $player['playerNo'] = intval($player['playerNo']);
            $player['flowers'] = intval($player['flowers']);
            $player['fruits'] = intval($player['fruits']);
            $player['grains'] = intval($player['grains']);
            $player['energy'] = intval($player['energy']);
            $player['rage'] = intval($player['rage']);

            if ($player['chosenToken'] !== null && intval($this->gamestate->state_id()) == ST_MULTIPLAYER_CHOOSE_TOKEN) {
                $player['chosenToken'] = $currentPlayerId == $playerId ? intval($player['chosenToken']) : 0;
            }
            $player['line'] = $this->getCardsByLocation('line'.$playerId);
            $player['deckCount'] = intval($this->cards->countCardInLocation('pdeck'.$playerId));
            $player['discardCount'] = intval($this->cards->countCardInLocation('discard'.$playerId));
            $player['deckTopCard'] = Card::onlyId($this->getCardFromDb($this->cards->getCardOnTop('pdeck'.$playerId)));
            $player['discardTopCard'] = Card::onlyId($this->getCardFromDb($this->cards->getCardOnTop('discard'.$playerId)));

            if ($currentPlayerId == $playerId) {
                $result['usedObjects'] = $this->getUsedObjects($playerId);
                $player['visibleTopCard'] = $this->getLastCard($playerId);
            }

            if ($isEndScore) {
                $player['fullDeck'] = $this->getFullDeck($playerId);
            }
        }

        /*$result['costs'] = $this->getGlobalVariable(COSTS, true);

        $selected = $this->getCardsByLocation('selected');
        $result['selected'] = array_map(fn($card) => $currentPlayerId == $card->locationArg ? $card : Card::onlyId($card), $selected);*/
        $table = [];
        $tableTopCard = [];
        foreach ([ORANGUTANS, CHIMPANZEES, GORILLAS, MANDRILLS] as $monkeyType) {
            foreach ([1, 2] as $level) {
                $table[$monkeyType * 10 + $level] = intval($this->cards->countCardInLocation("deck-$monkeyType-$level"));
                $tableTopCard[$monkeyType * 10 + $level] = Card::onlyId($this->getCardFromDb($this->cards->getCardOnTop("deck-$monkeyType-$level")));
            }
        }
        $result['table'] = $table;
        $result['tableTopCard'] = $tableTopCard;
        $result['objects'] = $this->getGlobalVariable(OBJECTS, true) ?? [];
        $result['lastTurn'] = !$isEndScore && boolval($this->getGameStateValue(LAST_TURN));

        
        $result['TEMP'] = $this->CARDS;
  
        return $result;
    }

    /*
        getGameProgression:
        
        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).
    
        This method is called each time we are in a game state with the "updateGameProgression" property set to true 
        (see states.inc.php)
    */
    function getGameProgression() {
        $maxScore = intval($this->getUniqueValueFromDB("SELECT max(`player_score`) FROM player"));
        return $maxScore * 100 / 80;
    }

//////////////////////////////////////////////////////////////////////////////
//////////// Zombie
////////////

    /*
        zombieTurn:
        
        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).
        
        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message. 
    */

    function zombieTurn( $state, $active_player )
    {
    	$statename = $state['name'];
    	
        if ($state['type'] === "activeplayer") {
            switch ($statename) {
                default:
                    $this->gamestate->nextState( "next" );
                	break;
            }

            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive( $active_player, 'next');
            
            return;
        }

        throw new feException( "Zombie mode not supported at this game state: ".$statename );
    }
    
///////////////////////////////////////////////////////////////////////////////////:
////////// DB upgrade
//////////

    /*
        upgradeTableDb:
        
        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.
    
    */
    
    function upgradeTableDb($from_version) {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345
        
        /*if ($from_version <= 2305092157) {
            $sql = "ALTER TABLE `DBPREFIX_player` ADD `can_see_top_card` SMALLINT UNSIGNED NOT NULL DEFAULT 0";
            self::applyDbUpgradeToAllDB( $sql );
        }*/
    }    
}
