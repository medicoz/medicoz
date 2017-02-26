nclude <cmath>
#include <cstdio>
#include <vector>
#include <iostream>
#include <set>
#include <map>
#include <algorithm>
using namespace std;


int main() {
    /* Enter your code here. Read input from STDIN. Print output to STDOUT */  
    int q, type, marks ;
    string str; 
    cin >> q;
   
    map <string, int> map;
    while(q--) {
    	 cin >> type;
        if(type == 1) {
            cin >> str >> marks;
            if( map.find(str) != map.end() ) {
            	map[str] = map[str] + marks;
            } else {
            	 map.insert(make_pair(str,marks));
            }
           
        }
        if(type == 2) { 
            cin >> str;
            map[str] = 0;
          //  map.erase(str);
        }
        if(type == 3) {
            cin >> str;
            cout << map[str] << endl;
        }
    }
    return 0;
}

