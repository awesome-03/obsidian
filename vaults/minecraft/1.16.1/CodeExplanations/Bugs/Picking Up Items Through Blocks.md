---
publish: true
created: 2026-11-06T16:56:02.045Z
modified: 2026-11-21T16:09:36.990Z
---

# Item Pickup

Every game tick, the server takes the player's boundary box and grows it by 1 block on the sides and 0.5 blocks at the top and bottom. Any item that intersects with that box gets picked up (boxes that only touch don’t count).

# Float Errors

Game stores boundary boxes using their edges in a float number. When the box moves, the edge locations get updated accordingly. However, when moving over a coordinate that is a power of 2 in one axis, they snap to numbers with different levels of precision. This results in the edges getting shifted over time when repeatedly crossing coordinates that are a power of 2.

When something moves against a wall, the boundary box gets calculated from the middle of its hitbox, and if this hitbox got a tiny bit narrower due to float errors, it can actually clip into the block by 0.000000000000002 blocks (2x10⁻¹⁵) or more. Which is why it's possible for the player to sometimes pick up items with a block in between them.

# Shape Updates

When the player's hitbox shape changes, the game rebuilds the hitbox to be exactly 0.6 blocks wide, removing the float errors. If the rebuild is done while standing on a power of 2 coordinate, the float error gets applied once.

A full list of methods to rebuild the hitbox are:

- sneaking
- swimming
- crawling
- gliding
- using a riptide trident
- getting in/out of a bed
- dying
- respawning
- relogging
- changing dimensions
- /tp
- /spreadplayers
- using an ender pearl
- eating chorus fruit
- going through an end gateway
- riding/un-riding something
- trying to go past the world border
- getting rubber-banded by the server
- teleporting back after mining a "spawn protected" block

# Recreation

1. Go into a world and place a block on a flat ground, then throw an item against one side of that wall and go to the opposite side of the block.
2. Crouch once, and go against the block you placed. Then run this command `/data get entity @s Pos` and look at the coordinate in the same axis as you and the item.
3. Then find a coordinate that is a power of 2 in the same axis, and repeatedly go between both sides of that coordinate (e.g. go near x = 16 and go past 15.7 and 16.3 over and over again) to build up rounding error.
4. Go against the block you previously placed again and you will be able to pick up the item from the other side.
   - IF YOU DIDN'T, just keep going between the coordinates again while making sure you never cause any shape updates, and try again.
5. After being able to pick up your item, run the previous command again and check the coordinate, it will have changed to be closer to the item.
6. Then you can crouch and move against the block again to confirm that your shape returned back to its normal size.
