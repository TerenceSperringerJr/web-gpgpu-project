/* Graduate Project ADD_ROWS shader */

"use strict";

var ADD_ROWS =
`
//This computation simply adds all of the rows of the inputVector (matrix) into the last row
//This shader was hard-code designed only for 100x100 inputVector
//TurboJS predefines Vertex Shader and leaves us with only the Fragment Shader =(

const float CELL_COUNT = ${HW3_LIBRARY.cellCount}.;
const float GRAPH_LENGTH = ${HW3_LIBRARY.graphSize}.;
const float INDEX_FACTOR = 128.; //10+(2^4), 100+(2^7)
//const float SIZE = CELL_COUNT / 4.;

vec4 readTexture2DFromXY(vec2 position) {
	return texture2D(u_texture, position);
}

vec2 idToRealXY(float ID) {
	float real_y = float(int(ID) / int(CELL_COUNT));
	return vec2(ID - (real_y * CELL_COUNT), real_y);
}

vec2 revertToPos(float real_x, float real_y) {
	float ID = (real_y * CELL_COUNT) + real_x;
	
	vec2 position;
	position.x = (ID - 1.) / 256.;
	position.x -= float(int(position.x));
	position.y = float((int(ID / 256.) * 2) + 1) / 128.;
	
	return position;
}

void main(void) {
	float end_x = pos.x * INDEX_FACTOR;
	float end_y = (pos.y * INDEX_FACTOR) - 1.;
	float end_ID = (end_y * INDEX_FACTOR) + (end_x * 2.) + 1.;
	vec4 my_ID = vec4(end_ID - 3., end_ID - 2., end_ID - 1., end_ID);
	vec4 my_texture = read();
	vec4 to_add;
	
	vec2 real_xy = idToRealXY(end_ID);
	
	for(float y = (CELL_COUNT - 1.); y >= 0.; y--) {
		to_add = readTexture2DFromXY(revertToPos(real_xy.x, y));
		
		for(int i = 0; i < 4; i++) {
			if(my_ID[i] >= GRAPH_LENGTH) {
				gl_FragColor[i] += to_add[i];
			}
			else {
				gl_FragColor[i] = my_texture[i];
			}
		}
	}
	
	//commit(my_texture); //maps to gl_FragColor.rgba
	
	return;
}
`;
