function Wire(start, end)
{
	var myConnections = new Array();
	
	this.group = new WireGroup(this);
	
	this.start = new Pos(start.x, start.y);
	this.end = new Pos(end.x, end.y);

	this.selected = false;
	
	if (this.start.x > this.end.x || this.start.y > this.end.y)
	{
		var temp = this.start;
		this.start = this.end;
		this.end = temp;
	}
	
	this.clone = function()
	{
		return new Wire(this.start, this.end);		
	}

	this.render = function(context, offset)
	{
		if (this.selected)
		{
			context.globalAlpha = 0.5;
			context.fillStyle = "#6666FF";
			context.fillRect(this.start.x + offset.x - 4, this.start.y + offset.y - 4,
				this.end.x - this.start.x + 8, this.end.y - this.start.y + 8);
			context.globalAlpha = 1.0;
		}

		context.strokeStyle = "#000000";
		context.lineWidth = 2;
		
		context.beginPath();
		context.moveTo(this.start.x + offset.x, this.start.y + offset.y);
		context.lineTo(this.end.x + offset.x, this.end.y + offset.y);
		context.stroke();
		context.closePath();
		
		context.fillStyle = "#000000";
		
		for (var i = 0; i < myConnections.length; ++ i)
		{
			var other = myConnections[i];
			if (other.isVertical() && !this.isVertical())
			{
				var pos = this.crossPos(other);

				if ((pos.equals(this.start) || pos.equals(this.end))
					&& (pos.equals(other.start) || pos.equals(other.end)))
					continue;

				context.beginPath();
				context.arc(pos.x + offset.x, pos.y + offset.y, 3, 0, Math.PI * 2, true);
				context.fill();
				context.closePath();
			}
		}
	}
	
	this.getConnections = function()
	{
		return myConnections;
	}
	
	this.isHorizontal = function()
	{
		return this.start.y == this.end.y;
	}
	
	this.isVertical = function()
	{
		return this.start.x == this.end.x;
	}
	
	this.runsAlong = function(wire)
	{
		return (this.isHorizontal() && wire.isHorizontal()
			&& this.start.y == wire.start.y && this.start.x <= wire.end.x
			&& this.end.x >= wire.start.x)
			|| (this.isVertical() && wire.isVertical()
			&& this.start.x == wire.start.x && this.start.y <= wire.end.y
			&& this.end.y >= wire.start.y);
	}
	
	this.merge = function(wire)
	{
		var connections = wire.getConnections();
	
		for (var i = 0; i < connections.length; ++ i)
		{
			var w = connections[i];
			w.disconnect(wire);
			
			if (w != this && !myConnections.contains(w))
			{
				this.connect(w);
				w.connect(this);
			}
		}
		
		if (this.isHorizontal())
		{
			this.start.x = Math.min(this.start.x, wire.start.x);
			this.end.x   = Math.max(this.end.x,   wire.end.x  );
		}
		else
		{
			this.start.y = Math.min(this.start.y, wire.start.y);
			this.end.y   = Math.max(this.end.y,   wire.end.y  );
		}
	}
	
	this.crossesPos = function(pos)
	{
		return (this.isHorizontal() && this.start.y == pos.y
			&& this.start.x <= pos.x && this.end.x >= pos.x)
			|| (this.isVertical() && this.start.x == pos.x
			&& this.start.y <= pos.y && this.end.y >= pos.y);
	}
	
	this.intersects = function(wire)
	{
		return this.start.x <= wire.end.x && this.end.x >= wire.start.x &&
			this.start.y <= wire.end.y && this.end.y >= wire.start.y;
	}
	
	this.crosses = function(wire)
	{
		return this.start.x < wire.end.x && this.end.x > wire.start.x &&
			this.start.y < wire.end.y && this.end.y > wire.start.y;
	}
	
	this.crossPos = function(wire)
	{
		if (this.isVertical() && wire.isHorizontal())
			return new Pos(this.start.x, wire.start.y);
		else
			return new Pos(wire.start.x, this.start.y);
	}
	
	this.canConnect = function(wire)
	{
		return !myConnections.contains(wire) &&
			this.intersects(wire) && !this.crosses(wire);
	}

	this.hasConnection = function(pos)
	{
		for (var i = myConnections.length - 1; i >= 0; --i)
			if (myConnections[i].crossesPos(pos)) return true;

		return false;
	}
	
	this.connect = function(wire)
	{
		myConnections.push(wire);
	}
	
	this.disconnect = function(wire)
	{
		var index = myConnections.indexOf(wire);
		myConnections.splice(index, 1);
	}
	
	this.toString = function()
	{
		return "(" + this.start.x + "," + this.start.y + ":" + this.end.x + "," + this.end.y + ")";
	}
}