nclude <iostream>
#include <vector>
#include <limits>

using namespace std;

int minimum (int , int); 
int minimum (int a, int b) {
    if (a < b) return a ;
    else return b;
}
int main() {
	vector <int> v;
	int input;
	int n ;
	cin >>n ;
	while(n--) { 
	    cin >> input;
	  v.push_back(input);
	} 
	
	int min = v.size();
    for(int i = 0 ; i < v.size() ; i ++ ) { 
        int cnt = 0;
        for(int j = 0 ; j < v.size() ; j++) {
            if(v[i] != v[j])  cnt ++;
        }
        min = minimum(min, cnt) ;
    }
    
	cout << min<< endl;
	return 0;
}
