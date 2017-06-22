//
//  XQDPlugin.h
//  Pods
//
//  Created by EriceWang on 2017/6/13.
//
//

#import <UIKit/UIKit.h>
//version "0.0.10"

@interface XQDPlugin : NSObject
@property(nonatomic,readonly)  NSString *_Nonnull  appID;
@property(nonatomic,readonly) NSString *_Nonnull appKey;
@property(nonatomic,readonly) NSString *_Nonnull sdkVersion;
/**
 *  返回时定义自定义操作，如果需要返回指定的控制器可以自定义pop代码，同时返回YES， 否则返回NO，默认返回到进入功夫贷的控制器界面
 */
@property(nonatomic, copy) BOOL(^ _Nullable addCustomOperation)();


@property (assign, nonatomic) BOOL isSameStyleWithApplication;
+ (_Nonnull instancetype)sharedInstance;
/**
 steup the XQDPlugin With basical parameters

 @param appID the unique id for operator
 @param appKey public key for encrypt
 */
-(void)setupAPPID:(NSString* _Nonnull)appID appKey:(NSString* _Nonnull)appKey;

/**
 start the XQDPlugin

 @param mobile the mobile number of the user
 */
- (void)showWithMobile:(NSString* _Nullable)mobile;

@end
