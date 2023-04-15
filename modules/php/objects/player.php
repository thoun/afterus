<?php

class AfterUsPlayer {
    public int $id;
    public string $name;
    public string $color;
    public int $no;
    public int $score;
    public int $flowers;
    public int $fruits;
    public int $grains;
    public int $energy;
    public int $rage;

    public function __construct($dbPlayer) {
        $this->id = intval($dbPlayer['player_id']);
        $this->name = $dbPlayer['player_name'];
        $this->color = $dbPlayer['player_color'];
        $this->no = intval($dbPlayer['player_no']);
        $this->score = intval($dbPlayer['player_score']);
        $this->flowers = intval($dbPlayer['player_flower']);
        $this->fruits = intval($dbPlayer['player_fruit']);
        $this->grains = intval($dbPlayer['player_grain']);
        $this->energy = intval($dbPlayer['player_energy']);
        $this->rage = intval($dbPlayer['player_rage']);
    }
}
?>