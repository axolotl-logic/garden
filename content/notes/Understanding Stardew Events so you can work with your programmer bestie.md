---
created_at: 2026-06-04T10:20:00-04:00
modified_at: 2026-06-10T15:05:15-04:00
growth: evergreen
tags:
- stardew-valley/modding
global_pagerank: 0.004277457377825095
cluster_pagerank: 1.0
cluster_id: 93a3906297cbd28bfee46fad1bb1de21
---

An event can be conceptualized as all of a *location*, set of *preconditions*, and a series of *commands* called the event script. This covers the what, where, and when of things happening in an event. Let's look at each of these in-turn so it's less confusing.

First up is *location*. Ever notice how events trigger when you enter a new area? That area is specific to the event and is *where* the event will trigger. Every event starts with specifying that location.

To find a location name, you can can use the [Debug Mode](https://www.nexusmods.com/stardewvalley/mods/679) mod. When activating it, hovering over a section of the screen will reveal the name of the location along with the X,Y coordinates within that location. You will just need the location name.

Next up are the *preconditions*. A precondition is something that must be true in order for an event to occur. For example, perhaps a month and day of the year are required. And maybe it requires a certain amount of friendship. These would be the preconditions for the event.

After location and preconditions, one must define what happens during the event. This is referred to as the *event script*.

The event script is like a movie script but for the game. It is a sequence *commands*. What is a command? Think of it is telling the game to do something. Some commands are for orchestrating NPC movement and dialog, while many others change aspects of the world, player, and more.

Small set of example commands 
* Give an item via grab menu
* animate sprites by providing a series of frames
* Draw temporary sprites onto the map
* Asking questions and remembering the answer!
* Add a quest
* Set a conversation topic
* Show dialog... of course 

Before we get to the good stuff though, every event script starts with a special sequence of 3 specific commands. 

These initial commands answer (in order) these questions:

1. **Music** What music if any should play? Or should it continue as before?
2. **Location on map** Where in x,y coordinates should this happen within the already specified map?[^1]
3. **Characters** Who will be at the scene? Where will they be?  Which way should they be facing? Repeat for each character visible at start of the event.

After those commands, you can execute a wide variety of others. If you've seen it happen in Stardew Valley, there may be a command to make it happen, so ask your programmer bestie.

Try writing the scene out like it's a script to a movie or play. Worry about locations later and focus on dialogue. Then, after having that structure, add stage directions. First the bones, then the flesh, then the skin. Good luck!

[^1]: Use the Debug Mod to find the location.