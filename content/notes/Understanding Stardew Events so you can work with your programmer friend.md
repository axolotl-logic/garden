An event can be conceptualized as a description of what, where, and when *things* happen. What sort of things? All kinds!

First up is *location*. Every event starts with a location. You can get this by using the Debug Mod. When activating it, a crosshairs will appear and hovering over a section of the screen will reveal the location along with the X,Y coordinates within that location.

Next up are the *preconditions*. A precondition is something that must be true in order for an event to occur. For example, perhaps a month and day of the year are required. And maybe it requires a certain amount of friendship. These would be the preconditions for the event.

After location and preconditions, one must define what happens during the event. This is referred to as the *event script*.

The event script is a set of *commands*, executed in order. A command is a change to the dialogue UI, world, and much more.

Before you get to the good stuff, every event script starts with a special sequence of 3 or more specific commands. 

These initial commands answer (in order) these questions:

1. **Music** What music if any should play? Or should it continue as before?
2. **Location on map** Where in x,y coordinates should this happen within the already specified map?[^1]
3. **Characters** Who will be at the scene? Where will they be?  Which way should they be facing? Repeat this command for each character visible at start of the event.

After those commands, you can execute a wide variety of others. Some of them are for orchestrating NPC movement and dialog, while many others change aspects of the world, player, and more.

Small set of examples 
* Give an item via grab menu
* animate sprites by providing a series of frames
* Draw temporary sprites onto the map
* Asking questions and remembering the answer!
* Add a quest
* Set a conversation topic
* Dialog... of course

If you've seen it happen in Stardew Valley, there may be a command to make it happen, so ask.

Try writing the scene out like it's a script to a movie or a play. Worry about locations letter and focus on dialogue. Then after having that structure, add stage directions.

[^1]: Use the Debug Mod to find the location.
