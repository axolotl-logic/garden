After specifying the location an event occurs at and the preconditions that must be true in order for it to trigger (example: be the 3rd day of the month and have 750 friendship with Clint), one must define what actually happens during the event. This is referred to as the event script.

The event script is a set of commands, executed in order. Some of the commands are for orchestrating NPC movement and dialog, while many others change aspects of the world, player, and more. Examples could include adding quests or giving the player items via the grab menu. You can also temporary draw sprites onto the map, such as to add fun details and objects. You can even add animation by providing a set of images to be used as frames and a single "frame duration" (think FPS). Emotes can be shown as well. Players can be moved

Every event script starts with a set of specific commands. These are 1. the music (audio track id, none, or continue previous), 2. x and y coordinates of location, and 3. one or more characters, their starting location, and direction they face.

After those commands you can execute whatever commands you want!

Start off by drafting 

**Where** should this happen? Use the Debug Mod to find the location.
**When** should this be triggered?
**Who** will be at the scene?

And finally a script. Start out with just the dialog and fill in location, movement, emotes, and more later.

Try writing the scene in [[pseudocode]] 
