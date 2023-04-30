<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * AfterUs implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 * 
 * afterus.action.php
 *
 * AfterUs main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *       
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/afterus/afterus/myAction.html", ...)
 *
 */
  
  
  class action_afterus extends APP_GameAction
  { 
    // Constructor: please do not modify
   	public function __default()
  	{
  	    if( self::isArg( 'notifwindow') )
  	    {
            $this->view = "common_notifwindow";
  	        $this->viewArgs['table'] = self::getArg( "table", AT_posint, true );
  	    }
  	    else
  	    {
            $this->view = "afterus_afterus";
            self::trace( "Complete reinitialization of board game" );
      }
  	}

    public function moveCard() {
        self::setAjaxMode();     

        $index = self::getArg("index", AT_posint, true);
        $backwards = self::getArg("direction", AT_bool, true);
        $this->game->moveCard($index, $backwards ? -1 : 1);

        self::ajaxResponse();
    }

    public function validateCardOrder() {
        self::setAjaxMode();     

        $this->game->validateCardOrder();

        self::ajaxResponse();
    }

    public function activateEffect() {
        self::setAjaxMode();  

        $row = self::getArg("row", AT_posint, false);
        $cardIndex = self::getArg("cardIndex", AT_posint, false);
        $index = self::getArg("index", AT_posint, false);
        $this->game->activateEffect($row, $cardIndex, $index);  

        self::ajaxResponse();
    }

    public function skipEffect() {
        self::setAjaxMode();     

        $this->game->skipEffect();

        self::ajaxResponse();
    }

    public function confirmActivations() {
        self::setAjaxMode();     

        $this->game->confirmActivations();

        self::ajaxResponse();
    }

    public function chooseToken() {
        self::setAjaxMode();     

        $type = self::getArg("type", AT_posint, true);
        $this->game->chooseToken($type);

        self::ajaxResponse();
    }

    public function cancelChooseToken() {
        self::setAjaxMode();     

        $this->game->cancelChooseToken();

        self::ajaxResponse();
    }

    public function activateEffectToken() {
        self::setAjaxMode();     

        $row = self::getArg("row", AT_posint, true);
        $cardIndex = self::getArg("cardIndex", AT_posint, true);
        $index = self::getArg("index", AT_posint, true);
        $this->game->activateEffectToken($row, $cardIndex, $index);

        self::ajaxResponse();
    }

    public function neighborEffect() {
        self::setAjaxMode();     

        $type = self::getArg("type", AT_posint, true);
        $this->game->neighborEffect($type);

        self::ajaxResponse();
    }

    public function applyNeighborEffect() {
        self::setAjaxMode();     

        $type = self::getArg("type", AT_posint, true);
        $this->game->applyNeighborEffect($type);

        self::ajaxResponse();
    }

    public function cancelNeighborEffect() {
        self::setAjaxMode();     

        $this->game->cancelNeighborEffect();

        self::ajaxResponse();
    }  

    public function buyCard() {
        self::setAjaxMode();     

        $level = self::getArg("level", AT_posint, true);
        $type = self::getArg("type", AT_posint, true);
        $this->game->buyCard($level, $type);

        self::ajaxResponse();
    }

    public function endTurn() {
        self::setAjaxMode();     

        $this->game->endTurn();

        self::ajaxResponse();
    } 
  	
    public function setAutoGain() {
        self::setAjaxMode();

        $autoGain = self::getArg("autoGain", AT_bool, true);

        $this->game->setAutoGain($autoGain);

        self::ajaxResponse();
    }

    public function useRage() {
        self::setAjaxMode();

        $id = self::getArg("id", AT_posint, true);
        $this->game->useRage($id);

        self::ajaxResponse();
    }  

    public function useObject() {
        self::setAjaxMode();

        $number = self::getArg("number", AT_posint, true);
        $this->game->useObject($number);

        self::ajaxResponse();
    }  

    public function cancelObject() {
        self::setAjaxMode();
        
        $this->game->cancelObject();

        self::ajaxResponse();
    }  

    public function useMobilePhone() {
        self::setAjaxMode();

        $id = self::getArg("id", AT_posint, true);
        $type = self::getArg("type", AT_posint, true);
        $this->game->useMobilePhone($id, $type);

        self::ajaxResponse();
    }

    public function useMinibar() {
        self::setAjaxMode();

        $left = self::getArg("left", AT_posint, true);
        $right = self::getArg("right", AT_posint, true);
        $this->game->useMinibar($left, $right);

        self::ajaxResponse();
    }

    public function useGhettoBlaster() {
        self::setAjaxMode();

        $id = self::getArg("id", AT_posint, true);
        $this->game->useGhettoBlaster($id);

        self::ajaxResponse();
    }

    public function useGameConsole() {
        self::setAjaxMode();

        $id = self::getArg("id", AT_posint, true);
        $this->game->useGameConsole($id);

        self::ajaxResponse();
    }

    public function useMoped() {
        self::setAjaxMode();

        $type = self::getArg("type", AT_posint, true);
        $level = self::getArg("level", AT_posint, true);
        $this->game->useMoped($type, $level);

        self::ajaxResponse();
    }

    public function cancelLastMoves() {
        self::setAjaxMode();

        $this->game->cancelLastMoves();

        self::ajaxResponse();
    }

  }
  

