<?php

trait DebugUtilTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////

    function debugSetup() {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        } 

		//$this->debugSetRage(10);
		$this->debugSetEnergy(10);
		$this->debugSet('score', 78);
        //$this->debugSetLastTurn();
        
        //$this->debugLastTurn();
    }

    function debugSetLastTurn() {
        $this->setGameStateValue(LAST_TURN, 1);
    }
	
    function debugSet(string $field, int $amount) {
        $this->DbQuery("UPDATE player SET `player_$field` = $amount");
    }
    function debugSetPlayer($playerId, $field, $amount) {
        $this->DbQuery("UPDATE player SET `player_$field` = $amount where `player_id` = $playerId");
    }

    function debugSetFlower($amount) { $this->debugSet('flower', $amount); }
    function debugSetPlayerFlower($playerId, $amount) { $this->debugSetPlayer($playerId, 'flower', $amount); }
    function debugSetEnergy($amount) { $this->debugSet('energy', $amount); }
    function debugSetPlayerEnergy($playerId, $amount) { $this->debugSetPlayer($playerId, 'energy', $amount); }
    function debugSetRage($amount) { $this->debugSet('rage', $amount); }
    function debugSetPlayerRage($playerId, $amount) { $this->debugSetPlayer($playerId, 'rage', $amount); }

    public function debugReplacePlayersIds() {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        } 

		// These are the id's from the BGAtable I need to debug.
		/*$ids = [
            84319026,
86175279
		];*/
        $ids = array_map(fn($dbPlayer) => intval($dbPlayer['player_id']), array_values($this->getCollectionFromDb('select player_id from player order by player_no')));

		// Id of the first player in BGA Studio
		$sid = 2343492;
		
		foreach ($ids as $id) {
			// basic tables
			$this->DbQuery("UPDATE player SET player_id=$sid WHERE player_id = $id" );
			$this->DbQuery("UPDATE global SET global_value=$sid WHERE global_value = $id" );
			$this->DbQuery("UPDATE card SET card_location_arg=$sid WHERE card_location_arg = $id" );

			// 'other' game specific tables. example:
			// tables specific to your schema that use player_ids
			$this->DbQuery("UPDATE card SET card_location='line$sid' WHERE card_location='line$id'" );
			$this->DbQuery("UPDATE card SET card_location='pdeck$sid' WHERE card_location='pdeck$id'" );
			$this->DbQuery("UPDATE card SET card_location='discard$sid' WHERE card_location='discard$id'" );
            
			++$sid;
		}

        self::reloadPlayersBasicInfos();
	}

    function debug($debugData) {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        }die('debug data : '.json_encode($debugData));
    }
}
